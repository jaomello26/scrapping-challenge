import json
from collections import defaultdict
import spacy
from transformers import pipeline
import numpy as np
from spacy.tokens import Token

class ReviewTagger:
    def __init__(self):
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            tokenizer="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        # Load English language model
        self.nlp = spacy.load("en_core_web_sm")
        
        # Get English stop words from spaCy
        self.stop_words = self.nlp.Defaults.stop_words
        
        # Custom attribute mappings for normalization
        self.attribute_map = {
            'great': 'good',
            'excellent': 'good',
            'amazing': 'good',
            'fantastic': 'good',
            'wonderful': 'good',
            'outstanding': 'good',
            'terrible': 'bad',
            'horrible': 'bad',
            'awful': 'bad',
            'poor': 'bad'
        }
        
        # Quality-related terms (lemmatized)
        self.quality_terms = {
            'quality', 'sound', 'comfort', 'price', 'value', 'durability',
            'build', 'design', 'bass', 'audio', 'noise', 'volume', 'fit',
            'performance', 'construction', 'material', 'feature'
        }
        
        # Register custom token extension for normalized form
        if not Token.has_extension("normalized_form"):
            Token.set_extension("normalized_form", getter=self.get_normalized_form)
    
    def get_normalized_form(self, token):
        """Get normalized form of a token"""
        lemma = token.lemma_.lower()
        return self.attribute_map.get(lemma, lemma)
    
    def get_sentiment_score(self, text):
        result = self.sentiment_analyzer(text)[0]
        sentiment_score = (int(result['label'][0]) - 3) / 2
        return sentiment_score
    
    def is_valid_phrase(self, tokens):
        """Check if a sequence of tokens forms a valid phrase"""
        # Convert tokens to their normalized forms
        normalized = [token._.normalized_form for token in tokens]
        
        # Skip if contains stop words
        if any(token.lower_ in self.stop_words for token in tokens):
            return False
        
        # Check for quality terms
        has_quality = any(norm in self.quality_terms for norm in normalized)
        
        # Check for adjective + quality term pattern
        if len(tokens) >= 2:
            is_adj_quality = (
                tokens[0].pos_ == "ADJ" and 
                tokens[-1]._.normalized_form in self.quality_terms
            )
            return has_quality or is_adj_quality
        
        return False
    
    def extract_key_phrases(self, doc):
        """Extract meaningful key phrases using linguistic features"""
        key_phrases = []
        
        # Extract noun phrases with their modifiers
        for chunk in doc.noun_chunks:
            # Get the root and its modifiers
            modifiers = [token for token in chunk.root.children 
                        if token.dep_ in ['amod', 'compound'] and not token.is_stop]
            
            if modifiers and chunk.root.pos_ == "NOUN":
                # Create phrase with normalized forms
                phrase_tokens = modifiers + [chunk.root]
                if self.is_valid_phrase(phrase_tokens):
                    normalized_phrase = ' '.join(
                        token._.normalized_form for token in phrase_tokens
                    )
                    key_phrases.append(normalized_phrase)
        
        # Extract adjectival modifier patterns
        for token in doc:
            if token.pos_ == "ADJ" and not token.is_stop:
                for child in token.children:
                    if (child.pos_ == "NOUN" and 
                        child._.normalized_form in self.quality_terms):
                        phrase_tokens = [token, child]
                        if self.is_valid_phrase(phrase_tokens):
                            normalized_phrase = ' '.join(
                                token._.normalized_form for token in phrase_tokens
                            )
                            key_phrases.append(normalized_phrase)
        
        return list(set(key_phrases))
    
    def process_reviews(self, formatted_data):
        phrase_data = defaultdict(lambda: {'count': 0, 'sentiments': [], 'reviews': []})
        reviews = formatted_data['reviews']
        
        for i, review in enumerate(reviews):
            review_text = review['review_text']
            review_header = review['review_header']
            
            # Process header and text separately to maintain context
            header_doc = self.nlp(review_header)
            text_doc = self.nlp(review_text)
            
            # Extract phrases from both
            header_phrases = self.extract_key_phrases(header_doc)
            text_phrases = self.extract_key_phrases(text_doc)
            
            # Calculate sentiment (giving more weight to header)
            header_sentiment = self.get_sentiment_score(review_header)
            text_sentiment = self.get_sentiment_score(review_text)
            combined_sentiment = (2 * header_sentiment + text_sentiment) / 3
            
            # Combine phrases with proper weighting
            all_phrases = header_phrases + text_phrases
            
            # Update phrase data
            for phrase in set(all_phrases):
                phrase_data[phrase]['count'] += 1
                phrase_data[phrase]['sentiments'].append(combined_sentiment)
                phrase_data[phrase]['reviews'].append(i)
        
        # Organize tags
        tags = {'positive': {}, 'negative': {}}
        
        for phrase, data in phrase_data.items():
            if data['count'] >= 2:  # Minimum frequency threshold
                avg_sentiment = np.mean(data['sentiments'])
                
                if abs(avg_sentiment) >= 0.2:  # Clear sentiment threshold
                    tag_info = {
                        'frequency': data['count'],
                        'sentiment': float(avg_sentiment),
                        'reviews': sorted(list(set(data['reviews'])))
                    }
                    
                    category = 'positive' if avg_sentiment > 0 else 'negative'
                    tags[category][phrase] = tag_info
        
        # Sort tags
        for category in tags:
            tags[category] = dict(sorted(
                tags[category].items(),
                key=lambda x: (x[1]['frequency'], abs(x[1]['sentiment'])),
                reverse=True
            ))
        
        return tags
    
    def process_reviews_with_top_phrases(self, formatted_data):
        """Process reviews and return data with top phrases included"""
        # Get tags using existing method
        tags = self.process_reviews(formatted_data)
        
        # Extract top 6 phrases from each category
        top_phrases = {
            'positive': [],
            'negative': []
        }
        
        for category in ['positive', 'negative']:
            for phrase, info in list(tags[category].items())[:6]:  # Get top 6
                top_phrases[category].append({
                    'phrase': phrase,
                    'frequency': info['frequency'],
                    'sentiment': info['sentiment'],
                    'review_indices': info['reviews']
                })
        
        # Create new formatted data with phrases
        enhanced_data = {
            'product_info': formatted_data['product_info'],
            'key_phrases': {
                'positive': top_phrases['positive'],
                'negative': top_phrases['negative']
            },
            'reviews': formatted_data['reviews']
        }
        
        return enhanced_data

def main():
    # Load formatted data
    with open('formatted_data.json', 'r') as f:
        formatted_data = json.load(f)
    
    # Initialize and run tagger
    tagger = ReviewTagger()
    enhanced_data = tagger.process_reviews_with_top_phrases(formatted_data)
    
    # Save enhanced data
    with open('enhanced_formatted_data.json', 'w') as f:
        json.dump(enhanced_data, f, indent=2)
    
    # Print top phrases for verification
    print("\nTop Positive Phrases:")
    for phrase in enhanced_data['key_phrases']['positive']:
        print(f"- {phrase['phrase']:<30} | frequency: {phrase['frequency']:>2} | sentiment: {phrase['sentiment']:>6.2f}")
        print(f"  Found in {len(phrase['review_indices'])} reviews")
    
    print("\nTop Negative Phrases:")
    for phrase in enhanced_data['key_phrases']['negative']:
        print(f"- {phrase['phrase']:<30} | frequency: {phrase['frequency']:>2} | sentiment: {phrase['sentiment']:>6.2f}")
        print(f"  Found in {len(phrase['review_indices'])} reviews")

if __name__ == "__main__":
    main()