# Three movie recommendation systems with movielens dataset that use collaborative and content based filtering systems. 
# 1st Recommendation system implements 4 machine learning models from surprise library with collaborative approach. They are evaluated with RMSE, MAE metrics
## SVD, NMF, PMF, BaselineOnly
# 2nd Recommendation system implements a neuran network with collaborative approach and is evaluated with Binary Cross-Entropy
# 3rd Recommendation system implements a content based filtering system using a model from sentence tranformers and cosine similarity as output function 
# Steps to reproduce the code
### The environment.yml contains the libraries and specific versions needed to run the code
# Create the environment
conda env create -f environment.yml
# Activate the environment
conda activate myenv
# Run the code
python main.py
