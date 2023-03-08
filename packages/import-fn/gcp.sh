#!/usr/bin/env bash

PROJECT_ID=drive-testi-1608222904858
SERVICE_ACCOUNT_NAME=import-fn-user
# https://cloud.google.com/iam/docs/understanding-roles#pubsub.editor
ROLE=roles/pubsub.editor

# gcloud services enable dataflow.googleapis.com compute.googleapis.com logging.googleapis.com storage-component.googleapis.com storage-api.googleapis.com pubsub.googleapis.com cloudresourcemanager.googleapis.com cloudscheduler.googleapis.com

# gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME

gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role=$ROLE

# You can provide your gmail account access to pubsub but I rather download the JSON key and use that
# From somewhere here https://console.cloud.google.com/iam-admin/serviceaccounts/details/
# gcloud iam service-accounts add-iam-policy-binding SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com --member="user:USER_EMAIL" --role=roles/iam.serviceAccountUser
