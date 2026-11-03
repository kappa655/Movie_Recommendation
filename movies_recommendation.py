# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: light
#       format_version: '1.5'
#       jupytext_version: 1.16.4
#   kernelspec:
#     display_name: base
#     language: python
#     name: python3
# ---


import pandas as pd
import numpy as np
import matplotlib as plt

# # Read data

movies = pd.read_csv("movies.csv")
ratings = pd.read_csv("ratings.csv")
tags = pd.read_csv("tags.csv")
links = pd.read_csv("links.csv")



# # Exploratory Data Analysis (EDA)



# # Profile data

# # Pandas profiling 



# import ydata_profiling
# from ydata_profiling import ProfileReport
#
# movie_profile = ProfileReport(movies)
# ratings_profile = ProfileReport(ratings)
# tags_profile = ProfileReport(tags)
# # Save the profile report to an HTML file
# movie_profile.to_file("movies_profile_report.html")
# ratings_profile.to_file("ratings_report.html")
# tags_profile.to_file("tags_report.html")
#

# # Observations from pandas profiling



# **Ratings Distribution** <br>
# They have a mean value around 3.5 according to pandas profiling
# ![Rating Distribution](distribution_ratings.png)
#





# # Most popular genres in movie dataframe

genre_counts = movies['genres'].value_counts()

print(genre_counts)

# **Word Cloud genres** <br>
# Drama comedy Romance are the most common genres 
# ![Genre Counts](cloud_word_genres.png)



# **Word Cloud tags** <br>
# Comedy netflix dark atmospheric are the common tags that users comment 
# ![tags Counts](word_cloud_tags.png)





# # High rating users and Top rated movies 





# +
# Calculate average rating for each user
average_ratings = ratings.groupby('userId')['rating'].mean()

# Identify users with high average ratings
high_rating_users = average_ratings[average_ratings >= 4.5]

# Print the user IDs of users with high average ratings
print(high_rating_users.index.tolist())
# -



# +


# Calculate average rating for each movie
average_ratings = ratings.groupby('movieId')['rating'].mean()

# Sort movies by average rating in descending order
sorted_movies = average_ratings.sort_values(ascending=False)

# Select top-rated movies (top 5 here)
top_rated_movies = sorted_movies.head(5)


# -

top_rated_movies 

movies[movies['movieId'] == 88448]

# Merge the two DataFrames based on the "movieId" column
top_rated_movies_titles = pd.merge(top_rated_movies, movies, on='movieId')

top_rated_movies_titles



# +
#merged_df.head()
# -



# # User - Movie rating dataframe

# Pivot table to create the user-movie rating matrix
rating_matrix = ratings.pivot_table(values='rating', index='userId', columns='movieId')

ratings.head()



rating_matrix

# # Sparsity of the user item matrix

rating_matrix.shape

rating_matrix.size

# Calculate the number of missing values (NaNs)
missing_values = rating_matrix.isnull().sum().sum()
print(missing_values)

rated_movies = rating_matrix.size - missing_values
rated_movies





# +
# Calculate the total number of possible values
total_possible_values = rating_matrix.size

# Calculate the number of missing values (NaNs)
missing_values = rating_matrix.isnull().sum().sum()

# Calculate sparsity
sparsity = missing_values / total_possible_values

# Print the sparsity
print(f"Sparsity: {sparsity:.4f}")
# -

# **User item matrix is a sparse matrix , 2% of the matrix is filled with ratings**




from surprise import Dataset, SVD
from surprise import BaselineOnly, Dataset, Reader
from surprise.model_selection import cross_validate






# # Drop timestamp



ratings = ratings.drop("timestamp",axis=1)





# +

reader = Reader(rating_scale=(0.5, 5))


data = Dataset.load_from_df(ratings, reader)


# -



from surprise import KNNBaseline,KNNBasic,KNNWithMeans,KNNWithZScore,NormalPredictor,BaselineOnly


# # Baseline Model <br>
# # Normal Predictor 



# +
algo3 = NormalPredictor()
scores = cross_validate(algo3, data, measures=["RMSE", "MAE"], cv=5, verbose=True)


#RMSE MAE Evaluation
mean_rmse = np.mean(scores.get("test_rmse"))
mean_mae = np.mean(scores.get("test_mae"))
mean_fit_time = np.mean(scores.get("fit_time"))
mean_test_time = np.mean(scores.get("test_time"))
overall_time = mean_fit_time + mean_test_time
print(f"Mean RMSE is {mean_rmse:.3f}")
print(f"Mean MAE is {mean_mae:.3f}")   
print(f"Mean fit_time is {mean_fit_time:.3f}")   
print(f"Mean test_time is {mean_test_time:.3f}")   
print(f"Mean overall_time is {overall_time:.3f}") 
# -



# # Collaborative Filtering using Matrix Factorization techniques from surprise library<br>
# - **SVD**
# - **Probabilistic Matrix Factorization**
# - **Non-Negative Matrix Factorization** 
# - **BaselineOnly**





from surprise import NMF



# +
bsl_options = {
    "method": "sgd"
}
algorithms = [SVD(), SVD(biased=False), NMF(), BaselineOnly(bsl_options=bsl_options)]

rmse_results = []
mae_results = []
fit_time = []
test_time = []
overall_times = []

for algo in algorithms:
    # Run cross-validation and get scores
    scores = cross_validate(algo, data, measures=["RMSE", "MAE"], cv=5, verbose=True)
    ####### Calculate scores  for evaluation ########
    mean_rmse = np.mean(scores.get("test_rmse"))
    mean_mae = np.mean(scores.get("test_mae"))
    
    mean_fit_time = np.mean(scores.get("fit_time"))
    mean_test_time = np.mean(scores.get("test_time"))
    overall_time = mean_fit_time + mean_test_time
    
    ####### Add elements to the lists ########
    rmse_results.append(mean_rmse)
    mae_results.append(mean_mae)
    fit_time.append(mean_fit_time)
    test_time.append(mean_test_time)
    overall_times.append(overall_time)
    
# Evaluation RMSE MAE and time 
for i, algo in enumerate(algorithms):
    curr_rmse = rmse_results[i]
    curr_mae = mae_results[i]
    curr_fit_time = fit_time[i]
    curr_test_time = test_time[i]
    curr_overall_time = overall_times[i]
    
    print("\n\n\n")
    print(f"{algo.__class__.__name__} RMSE {curr_rmse:.3f} \t MAE {curr_mae:.3f} \t Fit time {curr_fit_time:.3f} \t Test time {curr_test_time:.3f} \t Overall time {curr_overall_time:.3f}")





# -





# # Plot metrics for each method





# +

import matplotlib.pyplot as plt

metrics = {
        "RMSE": rmse_results,
        "MAE": mae_results,
        "Fit_time": fit_time,
        "Test_time": test_time,
        "Overall_time": overall_times
}
    
metrics_names = list(metrics.keys())

SVD_metrics = {key: value[0] for key, value in metrics.items()}
PMF_metrics = {key: value[1] for key, value in metrics.items()}
NMF_metrics = {key: value[2] for key, value in metrics.items()}
Bsl_metrics = {key: value[3] for key, value in metrics.items()}

SVD_values = list(SVD_metrics.values())
PMF_values = list(PMF_metrics.values())
NMF_values = list(NMF_metrics.values())
Bsl_values = list(Bsl_metrics.values())

###### SVD Metrics #######

colors = ['skyblue', 'red', 'lightblue', 'magenta', 'brown']

plt.figure(figsize=(12, 6))
bars1 = plt.bar(metrics_names, SVD_values, color=colors)
plt.xlabel('Metrics')
plt.title('SVD Metrics')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.legend(bars1, metrics_names, loc='upper center', bbox_to_anchor=(0.7, 1))

for i, value in enumerate(SVD_values):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')

plt.show()

###### PMF Metrics #######
plt.figure(figsize=(12, 6))
bars2 = plt.bar(metrics_names, PMF_values, color=colors)
plt.legend(bars2, metrics_names, loc='upper center', bbox_to_anchor=(0.7, 1))
plt.xlabel('Metrics')
plt.title('PMF Metrics')
plt.grid(axis='y', linestyle='--', alpha=0.7)

for i, value in enumerate(PMF_values):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')

plt.show()

###### NMF Metrics #######
plt.figure(figsize=(12, 6))
bars3 = plt.bar(metrics_names, NMF_values, color = colors)
plt.legend(bars3, metrics_names, loc='upper left')
plt.xlabel('Metrics')
plt.title('NMF Metrics')
plt.grid(axis='y', linestyle='--', alpha=0.7)

for i, value in enumerate(NMF_values):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')

plt.show()

###### Matrix Factorization loss function using SGD to minimize it  ######
plt.figure(figsize=(12, 6))
bars9 = plt.bar(metrics_names, Bsl_values, color=colors)
plt.xlabel('Metrics')
plt.title('BaselineOnly metrics')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.legend(bars9, metrics_names, loc='upper center', bbox_to_anchor=(0.7, 1))

for i, value in enumerate(Bsl_values):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')

plt.show()
# -



# # Compare metrics between SVD, PMF, NMF, Bsl



# +
models = ["SVD", "PMF", "NMF", "Baseline"]

colors2 = ['blue', 'orange', 'green', "gray"]

# Plotting the bar chart
plt.figure(figsize=(12, 8))
bars = plt.bar(models, rmse_results, color=colors2)
plt.title('Comparison of RMSE Values for SVD, NMF, PMF and Baseline')
plt.xlabel('Matrix Factorization Models')
plt.ylabel('Root Mean Squared Error (RMSE)')
plt.ylim(0, max(rmse_results) + 0.1)  # Adjust the y-axis limit if needed
plt.grid(axis='y', linestyle='--', alpha=0.7)

###legend
plt.legend(bars, models, loc='upper right')

# Adding text labels with RMSE values on top of the bars
for i, value in enumerate(rmse_results):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')
    
# Show the plot
plt.show()


# -





# # MAE

# +
plt.figure(figsize=(12, 8))
bars4 = plt.bar(models, mae_results, color=colors2)
plt.title('Comparison of MAE Values for SVD, NMF, PMF and Baseline')
plt.xlabel('Matrix Factorization Models')
plt.ylabel('Mean Squared Error (MAE)')
plt.ylim(0, max(mae_results) + 0.1)  # Adjust the y-axis limit if needed
plt.grid(axis='y', linestyle='--', alpha=0.7)

###legend
plt.legend(bars4, models, loc='upper right')

# Adding text labels with RMSE values on top of the bars
for i, value in enumerate(mae_results):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')
    
# Show the plot
plt.show()
# -



# # Fit time



# +
plt.figure(figsize=(12, 8))
bars5 = plt.bar(models, fit_time, color=colors2)
plt.title('Comparison of fit time for SVD, NMF, PMF and Baseline')
plt.xlabel('Matrix Factorization Models')
plt.ylabel('Fit time (seconds)')
plt.grid(axis='y', linestyle='--', alpha=0.7)

###legend
plt.legend(bars5, models, loc='upper left')

# Adding text labels with RMSE values on top of the bars
for i, value in enumerate(fit_time):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')
    
# Show the plot
plt.show()
# -









# # Test time

# +
plt.figure(figsize=(12, 8))
bars6 = plt.bar(models, test_time, color=colors2)
plt.title('Comparison of test time for SVD, NMF, PMF and Baseline')
plt.xlabel('Matrix Factorization Models')
plt.ylabel('Test time (seconds)')
plt.ylim(0, max(test_time) + 0.1)  # Adjust the y-axis limit if needed
plt.grid(axis='y', linestyle='--', alpha=0.7)

###legend
plt.legend(bars6, models, loc='upper right')

# Adding text labels with RMSE values on top of the bars
for i, value in enumerate(test_time):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')
    
# Show the plot
plt.show()
# -







# # Overall time

# +
plt.figure(figsize=(12, 8))
bars7 = plt.bar(models, overall_times, color=colors2)
plt.title('Comparison of overall time for SVD, NMF, PMF and Baseline')
plt.xlabel('Matrix Factorization Models')
plt.ylabel('Overall time (seconds)')
plt.grid(axis='y', linestyle='--', alpha=0.7)

###legend
plt.legend(bars7, models, loc='upper left')

# Adding text labels with RMSE values on top of the bars
for i, value in enumerate(overall_times):
    plt.text(i, value + 0.005, f'{value:.3f}', ha='center', va='bottom')
    
# Show the plot
plt.show()
# -



from surprise.model_selection import train_test_split



movies_and_ratings = pd.merge(movies, ratings, on='movieId')
#final_df = pd.merge(movies_and_ratings, tags, on=['movieId', 'userId'], how='left')
#final_df = final_df.drop("timestamp", axis=1)





# # Get top 10 rated movies from a user



# +

while True:
    user_id = input("Enter a user id (1-610): ")
    
    if not user_id.isdigit() or int(user_id) not in range(1, 611):
        print("Invalid user id. Please enter a valid id\n")
    else:
        user_id = int(user_id)
        break
    
    
    
print(f"Top 10 rated movies from user {user_id}")
# Sort the ratings in descending order for the specific user
user_sorted_ratings = movies_and_ratings[movies_and_ratings['userId'] == user_id].sort_values(by='rating', ascending = False)

# Specify the top N movies you want to retrieve
top_n = 10  

# Get the top N movies based on sorted ratings
top_movies_for_user = user_sorted_ratings.head(top_n)
top_movies_for_user
# -



# # Top 10 predicted ratings for a specific user 



# ## Fit an algorithm from algorithms in dataset

# +
#####  algorithms = [SVD(), SVD(biased=False), NMF(), BaselineOnly(bsl_options=bsl_options)] ####

bsl_options = {
    "method": "sgd"
}
algorithms = [SVD(), SVD(biased=False), NMF(), BaselineOnly(bsl_options=bsl_options)]

while True:
    print("Algorithms to fit:")
    print("1.  SVD")
    print("2.  PMF")
    print("3.  NMF")
    print("4.  BaselineOnly")
    
    print("\n")
    algo = input("Enter a number (1-4): ")
    
    if not algo.isdigit() or int(algo) not in range(1, len(algorithms) + 1):
        print("Invalid choice. Please enter a valid number\n")
    else:
        algo = int(algo)
        break

trainset, testset = train_test_split(data, test_size=0.25)

algorithms[algo-1].fit(trainset)
predictions = algorithms[algo-1].test(testset)

# -





# ## Create testset with the ratings user didnt rate

# +
####### Get unique ids #########
unique_ids = movies["movieId"].unique()
####### Get the movies that a user rated #########
ids_rated = ratings.loc[ratings["userId"] == user_id, "movieId"]
###### Movies to predict #######
movies_to_pred = np.setdiff1d(unique_ids,ids_rated)
###### Rated movies #######
rated_movies = unique_ids.shape[0] - movies_to_pred.shape[0]


testset_user = [[user_id, mv_id, None] for mv_id in movies_to_pred]
predictions_user = algorithms[algo-1].test(testset_user)
predictions_user
# -





# ## Sort the predicted ratings in top 10 

# +
sorted_predictions_user = sorted(predictions_user, key=lambda x: x.est, reverse=True)

top_10_predictions_user = sorted_predictions_user[:10]
top_10_predictions_user
# -





# ## Create a dataframe that maps movieId to titles genres tags

# +
#### Get top 10 movie ids ####
movie_ids = [prediction.iid for prediction in top_10_predictions_user]


# Movie_ids to dataframe 
movie_ids_df = pd.DataFrame({'movieId': movie_ids})

# Find corresponding titles and genres from the movies DataFrame
movies_pred = pd.merge(movie_ids_df, movies, on='movieId', how='left')

estimated_ratings = [prediction.est for prediction in top_10_predictions_user]
movies_pred['est_rating'] = estimated_ratings

##### change columns ######
movies_pred = movies_pred[['movieId', 'title', 'genres', 'est_rating']]
movies_pred
# -



# # NEURAL

import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import keras
from keras import layers
import time





ratings_nn = pd.read_csv("ratings.csv")



# # Encode users and movies as integer indices.

# +
user_ids = ratings_nn["userId"].unique().tolist()
user2user_encoded = {x: i for i, x in enumerate(user_ids)}
userencoded2user = {i: x for i, x in enumerate(user_ids)}
movie_ids = ratings_nn["movieId"].unique().tolist()
movie2movie_encoded = {x: i for i, x in enumerate(movie_ids)}
movie_encoded2movie = {i: x for i, x in enumerate(movie_ids)}
ratings_nn["user"] = ratings_nn["userId"].map(user2user_encoded)
ratings_nn["movie"] = ratings_nn["movieId"].map(movie2movie_encoded)

num_users = len(user2user_encoded)
num_movies = len(movie_encoded2movie)
ratings_nn["rating"] = ratings_nn["rating"].values.astype(np.float32)

min_rating = min(ratings_nn["rating"])
max_rating = max(ratings_nn["rating"])
# -









# # Normalization of ratings

ratings_nn = ratings_nn.sample(frac=1, random_state=42)
x = ratings_nn[["user", "movie"]].values
# Normalize the targets between 0 and 1. Makes it easy to train.
y = ratings_nn["rating"].apply(lambda x: (x - min_rating) / (max_rating - min_rating)).values
# Assuming training on 90% of the data and validating on 10%.
train_indices = int(0.9 * ratings_nn.shape[0])
x_train, x_val, y_train, y_val = (
    x[:train_indices],
    x[train_indices:],
    y[:train_indices],
    y[train_indices:],
)





# # We embed both users and movies in to 50-dimensional vectors.
#
# **The model computes a match score between user and movie embeddings via a dot product, and adds a per-movie and per-user bias. The match score is scaled to the [0, 1] interval via a sigmoid**

# +
import tensorflow as tf
from tensorflow.keras import layers

EMBEDDING_SIZE = 50

class RecommenderNet(tf.keras.Model):
    def __init__(self, num_users, num_movies, embedding_size, **kwargs):
        super().__init__(**kwargs)
        self.num_users = num_users
        self.num_movies = num_movies
        self.embedding_size = embedding_size
        self.user_embedding = layers.Embedding(
            num_users,
            embedding_size,
            embeddings_initializer="he_normal",
            embeddings_regularizer=tf.keras.regularizers.l2(1e-6),
        )
        self.user_bias = layers.Embedding(num_users, 1)
        self.movie_embedding = layers.Embedding(
            num_movies,
            embedding_size,
            embeddings_initializer="he_normal",
            embeddings_regularizer=tf.keras.regularizers.l2(1e-6),
        )
        self.movie_bias = layers.Embedding(num_movies, 1)

    def call(self, inputs):
        user_vector = self.user_embedding(inputs[:, 0])
        user_bias = self.user_bias(inputs[:, 0])
        movie_vector = self.movie_embedding(inputs[:, 1])
        movie_bias = self.movie_bias(inputs[:, 1])
        dot_user_movie = tf.reduce_sum(user_vector * movie_vector, axis=1, keepdims=True)
        # Add all the components (including bias)
        x = dot_user_movie + user_bias + movie_bias
        # The sigmoid activation forces the rating to between 0 and 1
        return tf.nn.sigmoid(x)
    
    
start_time = time.time()
model = RecommenderNet(num_users, num_movies, EMBEDDING_SIZE)
model.compile(
    loss=tf.keras.losses.BinaryCrossentropy(),
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
)

####### Train model ######
history = model.fit(
    x=x_train,
    y=y_train,
    batch_size=64,
    epochs=5,
    verbose=1,
    validation_data=(x_val, y_val),
)
end_time = time.time()
total_time = end_time - start_time
print(f"Total time taken: {total_time} seconds")
# -





# # Plot training and validation loss (binary cross entropy)

# +
import seaborn as sns
import matplotlib.pyplot as plt

sns.set(style="whitegrid")  

plt.figure(figsize=(10, 6))  

# Plot training and validation loss
sns.lineplot(x=range(1, len(history.history["loss"]) + 1), y=history.history["loss"], label="Train")
sns.lineplot(x=range(1, len(history.history["val_loss"]) + 1), y=history.history["val_loss"], label="Test")

plt.title("Binary Cross Entropy Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend(loc="upper right")
plt.show()

# -



# **We can see that while train test is getting lower every epoch, the validation set is increasing his loss after epoch 2**



mv_df = pd.read_csv("movies.csv")



# # Top 10 movie recommendation 

movies_watched_by_user = ratings_nn[ratings_nn.userId == user_id]
movies_not_watched = mv_df[
    ~mv_df["movieId"].isin(movies_watched_by_user.movieId.values)
]["movieId"]
movies_not_watched = list(
    set(movies_not_watched).intersection(set(movie2movie_encoded.keys()))
)
movies_not_watched = [[movie2movie_encoded.get(x)] for x in movies_not_watched]
user_encoder = user2user_encoded.get(user_id)
user_movie_array = np.hstack(
    ([[user_encoder]] * len(movies_not_watched), movies_not_watched)
)
pred_ratings_nn = model.predict(user_movie_array).flatten()
top_ratings_indices = pred_ratings_nn.argsort()[-10:][::-1]
recommended_movie_ids = [
    movie_encoded2movie.get(movies_not_watched[x][0]) for x in top_ratings_indices
]



# +

# Movie_ids to dataframe 
movie_ids_nn = pd.DataFrame({'movieId': recommended_movie_ids})

# Find corresponding titles and genres from the movies DataFrame
movies_pred_nn = pd.merge(movie_ids_nn, movies, on='movieId', how='left')

##### change columns ######
movies_pred_nn = movies_pred_nn
movies_pred_nn
# -






# # Content based filtering using titles and genres as features in item profile

import pandas as pd
import numpy as np
import matplotlib as plt
#pip install sentence-transformers

# # Copy of movies in order not to affect the movies dataframe

movies2 = pd.read_csv("movies.csv")



movies_content = movies2.copy()

movies_content







# # Check in format title to see how many movies do not have year. Format title has either 'title (year) ' or 'title (year1-year2) '

titles_without_year = movies_content[~movies_content['title'].str.contains(r'\(\d{4}(?:–\d{4})?\)')]
titles_without_year









# # Extract year from title and add a new column where we store year

movies_content['year'] = movies_content['title'].str.extract(r'\((\d{4}(?:–\d{4})?)\)')



movies_content.head()





# # Remove year from the title column

movies_content['title'] = movies_content['title'].str.replace(
    r'\s*\(\d{4}(?:–\d{4})?\)', '', regex=True
)


movies_content.head()



### Check if a movie doesnt have title ###
movies_content["title"].isnull().sum()



# # Remove movies that doesnt have genres

movies_content[movies_content["genres"] == '(no genres listed)']



movies_content = movies_content[movies_content["genres"] != '(no genres listed)']





# # Reset index because some rows deleted

movies_content= movies_content.reset_index(drop=True)



movies_content





# # Initialize model and remove | from genres in order to process them



# +
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-mpnet-base-v2', device='cpu')
# -

movies_content['genres_list'] = movies_content['genres'].str.split('|')



movies_content.head()





movies_content["title_list"] = movies_content['title'].apply(lambda x: [x]).tolist()



movies_content.head()





movies_content['metadata'] = movies_content['title_list'] + movies_content['genres_list']



movies_content.head()



# # Sentence transformer expects a list of strings <br>
# ## These strings are the title of the movie and their genres



movies_content['metadata'] = movies_content['metadata'].apply(lambda x: ' '.join(x))



movies_content.head()



meta_data = np.array(movies_content['metadata'])
meta_data



embeddings = model.encode(meta_data, batch_size=32, show_progress_bar=True)

embeddings.shape



from sklearn.metrics.pairwise import cosine_similarity

sim_matrix = cosine_similarity(embeddings)
sim_matrix





# # Get top 10 similar movies with the one that we prompt. <br>

movies2 = movies2[movies2["genres"] != '(no genres listed)']

movies2= movies2.reset_index(drop=True)


# # Dataframe top_movies_user contains the top 10 movies the user likes the most
# # By entering a movie_title from this dataframe in the function below,
# # it recommends based on the content filtering model, top 10 similar movies 
# # with the movie you prompted. The result is saved in the recommendations 
# # dataframe


"""
# +
def get_recommendations(movie_title, similarity_matrix, df):
    idx = df[df['title'] == movie_title].index[0]
    sim_scores = list(enumerate(similarity_matrix[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11]  # Get top 10 similar movies

    movie_indices = [i[0] for i in sim_scores]
    return movies2.loc[movie_indices, ['movieId','title',"genres"]]


movie_title = 'Despicable Me'
recommendations = get_recommendations(movie_title, sim_matrix, movies_content)
recommendations
# -

"""










