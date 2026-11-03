# 🎬 Movie Recommendation Systems

Three movie recommendation systems employing collaborative and content-based filtering techniques leveraging Movielens dataset. <br>

## 1. Collaborative Filtering Recommendation System

First recommendation system implements four machine learning models (SVD, NMF, PMF, BaselineOnly) from the Surprise library. <br>

They are evaluated with:

- RMSE
- MAE
- Fit time
- Test time

It outputs **top 10 recommended movies** for the user. <br>

---

## 2. Neural Network Recommendation System

Second recommendation system implements a neural network and is evaluated with:

- Binary Cross-Entropy

---

## 3. Content-Based Recommendation System

Third recommendation system implements a content-based filtering system using a state-of-the-art model from Sentence Transformers and cosine similarity as the similarity metric.

---
## Steps to reproduce the code
The environment.yml contains the libraries and specific versions needed to run the code
## Create the environment
conda env create -f environment.yml
## Activate the environment
conda activate myenv
## Run the code
python main.py
