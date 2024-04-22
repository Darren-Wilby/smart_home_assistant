#!/bin/bash

kubectl apply -f client/deployment.yaml
kubectl apply -f client/service.yaml
kubectl apply -f server/deployment.yaml
kubectl apply -f server/service.yaml