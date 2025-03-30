from datasketch import MinHash, MinHashLSH
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Set, Tuple
import logging

class CheatingDetector:
    def __init__(self, 
                 num_perm: int = 128,
                 exact_threshold: float = 0.9,
                 paraphrase_threshold: float = 0.7):
        """
        Initialize the cheating detector.
        
        Args:
            num_perm (int): Number of permutations for MinHash
            exact_threshold (float): Threshold for exact copy detection
            paraphrase_threshold (float): Threshold for paraphrase detection
        """
        self.num_perm = num_perm
        self.exact_threshold = exact_threshold
        self.paraphrase_threshold = paraphrase_threshold
        
        # Initialize LSH index
        self.lsh = MinHashLSH(threshold=exact_threshold, num_perm=num_perm)
        
        # Initialize TF-IDF vectorizer
        self.tfidf = TfidfVectorizer(
            strip_accents='unicode',
            lowercase=True,
            analyzer='word',
            ngram_range=(1, 3),
            max_features=5000
        )
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _create_minhash(self, text: str) -> MinHash:
        """
        Create a MinHash object for a text.
        
        Args:
            text (str): Input text
            
        Returns:
            MinHash: MinHash object
        """
        minhash = MinHash(num_perm=self.num_perm)
        for word in text.split():
            minhash.update(word.encode('utf-8'))
        return minhash

    def detect_exact_copies(self, submissions: List[Dict]) -> List[Dict]:
        """
        Detect exact copies among submissions using MinHash LSH.
        
        Args:
            submissions (List[Dict]): List of submission dictionaries with 'id' and 'text' keys
            
        Returns:
            List[Dict]: List of detected exact copies with their details
        """
        try:
            # Clear existing LSH index
            self.lsh = MinHashLSH(threshold=self.exact_threshold, num_perm=self.num_perm)
            
            exact_copies = []
            processed_ids = set()
            
            # Process each submission
            for submission in submissions:
                submission_id = submission['id']
                text = submission['text']
                
                if submission_id in processed_ids:
                    continue
                
                minhash = self._create_minhash(text)
                
                # Query similar items before inserting
                similar_ids = self.lsh.query(minhash)
                
                if similar_ids:
                    # Found exact copies
                    copies_group = {submission_id}
                    copies_group.update(similar_ids)
                    
                    exact_copies.append({
                        'type': 'exact_copy',
                        'submission_ids': list(copies_group),
                        'similarity_score': 1.0
                    })
                    
                    processed_ids.update(copies_group)
                
                # Insert the current submission
                self.lsh.insert(submission_id, minhash)
            
            return exact_copies
            
        except Exception as e:
            self.logger.error(f"Error detecting exact copies: {str(e)}")
            return []

    def detect_paraphrases(self, submissions: List[Dict]) -> List[Dict]:
        """
        Detect paraphrased content using TF-IDF and cosine similarity.
        
        Args:
            submissions (List[Dict]): List of submission dictionaries with 'id' and 'text' keys
            
        Returns:
            List[Dict]: List of detected paraphrases with their details
        """
        try:
            texts = [sub['text'] for sub in submissions]
            submission_ids = [sub['id'] for sub in submissions]
            
            # Create TF-IDF matrix
            tfidf_matrix = self.tfidf.fit_transform(texts)
            
            # Compute pairwise similarities
            similarities = cosine_similarity(tfidf_matrix)
            
            paraphrases = []
            processed_pairs = set()
            
            # Find similar pairs
            for i in range(len(submissions)):
                for j in range(i + 1, len(submissions)):
                    if (i, j) in processed_pairs:
                        continue
                        
                    similarity = similarities[i][j]
                    
                    if similarity >= self.paraphrase_threshold:
                        paraphrases.append({
                            'type': 'paraphrase',
                            'submission_ids': [submission_ids[i], submission_ids[j]],
                            'similarity_score': float(similarity)
                        })
                        
                        processed_pairs.add((i, j))
                        processed_pairs.add((j, i))
            
            return paraphrases
            
        except Exception as e:
            self.logger.error(f"Error detecting paraphrases: {str(e)}")
            return []

    def analyze_submissions(self, submissions: List[Dict]) -> Dict:
        """
        Analyze submissions for both exact copies and paraphrases.
        
        Args:
            submissions (List[Dict]): List of submission dictionaries with 'id' and 'text' keys
            
        Returns:
            Dict: Analysis results including detected copies and statistics
        """
        try:
            # Detect both types of copying
            exact_copies = self.detect_exact_copies(submissions)
            paraphrases = self.detect_paraphrases(submissions)
            
            # Collect all suspicious submissions
            suspicious_ids = set()
            for case in exact_copies + paraphrases:
                suspicious_ids.update(case['submission_ids'])
            
            # Calculate statistics
            stats = {
                'total_submissions': len(submissions),
                'suspicious_submissions': len(suspicious_ids),
                'exact_copy_cases': len(exact_copies),
                'paraphrase_cases': len(paraphrases),
                'suspicious_percentage': round(len(suspicious_ids) * 100 / len(submissions), 2)
            }
            
            return {
                'exact_copies': exact_copies,
                'paraphrases': paraphrases,
                'statistics': stats,
                'suspicious_ids': list(suspicious_ids)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing submissions: {str(e)}")
            return {
                'error': str(e),
                'exact_copies': [],
                'paraphrases': [],
                'statistics': {},
                'suspicious_ids': []
            }

    def update_thresholds(self, exact: float = None, paraphrase: float = None):
        """
        Update detection thresholds.
        
        Args:
            exact (float): New threshold for exact copy detection
            paraphrase (float): New threshold for paraphrase detection
        """
        if exact is not None:
            self.exact_threshold = max(0.0, min(1.0, exact))
            self.lsh = MinHashLSH(threshold=self.exact_threshold, num_perm=self.num_perm)
            
        if paraphrase is not None:
            self.paraphrase_threshold = max(0.0, min(1.0, paraphrase)) 