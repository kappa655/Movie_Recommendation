# 🎬 Movie Recommendation Systems

Interactive Movie Recommendation suite & Machine Learning Pipeline leveraging the MovieLens dataset.

---

## 🚀 How to Run Permanently for Free

This repository is configured with a unified **Dockerfile** containing both **Node.js (React UI + Express Server)** and **Python 3.10 (TensorFlow, Surprise, Sentence Transformers)**.

### Option 1: Free Deployment on Render.com (Recommended)
1. Push this repository to your **GitHub** account.
2. Sign up / Log in to [Render.com](https://render.com) (Free, no credit card required).
3. Click **New +** > **Web Service**.
4. Select your GitHub repository.
5. In **Environment**, choose **Docker**.
6. Select the **Free** instance type.
7. Click **Create Web Service**. Render will automatically build the container and provide you with a permanent public URL (e.g., `https://your-app.onrender.com`).

---

### Option 2: Free Deployment on Hugging Face Spaces (Ideal for ML workloads)
1. Create a free account on [Hugging Face](https://huggingface.co).
2. Go to **Spaces** > **Create new Space**.
3. Set Space SDK to **Docker** (Blank).
4. Connect or push your GitHub repository files (`git push`).
5. Hugging Face provides **16 GB RAM & 2 vCPUs** completely free for your models.

---

## 💻 Local Development

### 1. Running the Interactive Web App (Port 3000)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Running the Python Pipeline Standalone
Using Conda:
```bash
conda env create -f environment.yml
conda activate myenv
python movies_recommendation.py
```

Or using pip:
```bash
pip install -r requirements.txt
python movies_recommendation.py
```

---

## 🧠 System Architecture

### 1. Collaborative Filtering Recommendation System
- Implements 4 machine learning models from the Surprise library: **SVD**, **PMF** (biased=False), **NMF**, and **BaselineOnly** (SGD).
- Evaluated on RMSE, MAE, Fit Time, and Test Time with 5-fold cross-validation.
- Outputs personalized Top 10 movie recommendations for unrated items.

### 2. Neural Network Recommendation System (RecommenderNet)
- Custom TensorFlow/Keras model embedding users and movies into 50-dimensional vectors with learned biases and sigmoid activation.
- Trained with Binary Cross-Entropy loss.

### 3. Content-Based Recommendation System
- Preprocesses movie titles and genre vectors.
- Embeds metadata with Sentence Transformers (`all-mpnet-base-v2`).
- Ranks candidate titles via Cosine Similarity.
