# Google Cloud Services

## Compute Engine (VMs)

```bash
# List instances
gcloud compute instances list

# Create instance
gcloud compute instances create my-instance \
  --zone***REMOVED***us-central1-a \
  --machine-type***REMOVED***e2-medium \
  --image-family***REMOVED***debian-11 \
  --image-project***REMOVED***debian-cloud \
  --boot-disk-size***REMOVED***10GB

# SSH into instance
gcloud compute ssh my-instance --zone***REMOVED***us-central1-a

# Copy files
gcloud compute scp local-file.txt my-instance:~/remote-file.txt \
  --zone***REMOVED***us-central1-a

# Stop instance
gcloud compute instances stop my-instance --zone***REMOVED***us-central1-a

# Delete instance
gcloud compute instances delete my-instance --zone***REMOVED***us-central1-a
```

## Google Kubernetes Engine (GKE)

```bash
# Create cluster
gcloud container clusters create my-cluster \
  --zone***REMOVED***us-central1-a \
  --num-nodes***REMOVED***3 \
  --machine-type***REMOVED***e2-medium

# Get credentials
gcloud container clusters get-credentials my-cluster --zone***REMOVED***us-central1-a

# List clusters
gcloud container clusters list

# Resize cluster
gcloud container clusters resize my-cluster \
  --num-nodes***REMOVED***5 \
  --zone***REMOVED***us-central1-a

# Delete cluster
gcloud container clusters delete my-cluster --zone***REMOVED***us-central1-a
```

## Cloud Run (Serverless Containers)

```bash
# Deploy container
gcloud run deploy my-service \
  --image***REMOVED***gcr.io/PROJECT_ID/my-image:tag \
  --platform***REMOVED***managed \
  --region***REMOVED***us-central1 \
  --allow-unauthenticated

# List services
gcloud run services list

# Describe service
gcloud run services describe my-service --region***REMOVED***us-central1

# Delete service
gcloud run services delete my-service --region***REMOVED***us-central1
```

## App Engine

```bash
# Deploy application
gcloud app deploy app.yaml

# View application
gcloud app browse

# View logs
gcloud app logs tail

# List versions
gcloud app versions list

# Delete version
gcloud app versions delete VERSION_ID

# Set traffic split
gcloud app services set-traffic SERVICE \
  --splits v1***REMOVED***0.5,v2***REMOVED***0.5
```

## Cloud Storage

```bash
# Create bucket
gsutil mb gs://my-bucket-name

# Upload file
gsutil cp local-file.txt gs://my-bucket-name/

# Download file
gsutil cp gs://my-bucket-name/file.txt ./

# List contents
gsutil ls gs://my-bucket-name/

# Sync directory
gsutil rsync -r ./local-dir gs://my-bucket-name/remote-dir

# Set permissions
gsutil iam ch user:user@example.com:objectViewer gs://my-bucket-name

# Delete bucket
gsutil rm -r gs://my-bucket-name
```

## Cloud SQL

```bash
# Create instance
gcloud sql instances create my-instance \
  --database-version***REMOVED***POSTGRES_14 \
  --tier***REMOVED***db-f1-micro \
  --region***REMOVED***us-central1

# Create database
gcloud sql databases create my-database \
  --instance***REMOVED***my-instance

# Create user
gcloud sql users create my-user \
  --instance***REMOVED***my-instance \
  --password***REMOVED***PASSWORD

# Connect
gcloud sql connect my-instance --user***REMOVED***my-user

# Delete instance
gcloud sql instances delete my-instance
```

## Cloud Functions

```bash
# Deploy function
gcloud functions deploy my-function \
