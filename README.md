# Three movie recommendation systems employing collaborative and content-based filtering techniques leveraging Movielens dataset. <br>
# First Recommendation system implements four machine learning models (SVD, NMF, PMF, BaselineOnly) from surprise library. They are evaluated with RMSE, MAE metrics, fit and test time and output top 10 recommended movies for the user <br>
# Second Recommendation system implements a neural network and is evaluated with Binary Cross-Entropy. <br>
# Third Recommendation system implements a content based filtering system using a model from sentence tranformers and cosine similarity as output function 
# Steps to reproduce the code
### The environment.yml contains the libraries and specific versions needed to run the code
# Create the environment
conda env create -f environment.yml
# Activate the environment
conda activate myenv
# Run the code
python main.py
