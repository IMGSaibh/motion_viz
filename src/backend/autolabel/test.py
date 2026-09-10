import label_file_proc
import cluster
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

import joblib
import os

encoding_dim = 8
pca_dim = 6
num_clusters = 3
hidden_layers = [256]
min_cluster_size = 5
prec_thr = 0.9
recl_thr = 0.1
meth = "pca"

data_name = 'unnamed'

filepath = '/home/aiwlab/hack/motion_viz/data/labels/NaturalTalking_01.bvh_short.json'
X, y, scaler = label_file_proc.process(filepath)

if meth != "ae":
    dim = pca_dim
else:
    dim = encoding_dim

hl_str = '_'.join(map(str, hidden_layers)) if meth=='ae' else ''
cfgname = f"{data_name}_{meth}_k{num_clusters}_{hl_str}d{dim}"
print(f"Using configname: {cfgname}")

fname_model = os.path.join("clus_results/",cfgname+"_model")

if meth == 'ae':
    print(f"Using Autoencoder")
    model, kmeans_in = cluster.fit_predict_ae(X, hidden_layers, encoding_dim, verbose=1 )
    fname_model = fname_model+".keras"
    model.save(fname_model)

elif meth == 'pca':
    print(f"Using PCA")
    pca = PCA(n_components=pca_dim)
    kmeans_in = pca.fit_transform(X)
    fname_model = fname_model + ".pkl"
    #joblib.dump(pca, fname_model)
    
else:
    print("No method assigend!")
    pass

# ============================================================
# Clustering
# ============================================================
kmeans = KMeans(
    n_clusters=num_clusters,
    random_state=42,
    n_init=10
)
cluster_labels = kmeans.fit_predict(kmeans_in)

silhouette = silhouette_score(kmeans_in, cluster_labels)
print(f"Silhouette score: {silhouette:.4f}")