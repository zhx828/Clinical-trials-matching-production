## API Service

### Production: Build and Upload docker images to Docker Hub
1.  Build docker image: 
    ```
    docker build -t xxxx/clinical-trials-matching:[version] .
    ```
    You can run the command below to see if docker container works.
    ```
    docker run -p [port]:[port] -d xxxx/clinical-trials-matching:[version]
    ``` 
2.  Tag image: 
    ```
    docker tag [imageID] xxxx/clinical-trials-matching:[version]
    ```
3.  Push the image to Docker Hub:
    ```
    docker push xxxx/clinical-trials-matching:[version]
    ```

### Deployment locally
1. Apply k8s environment config file(Not include in this repo)
   ```
   kubectl apply -f ./k8s/clinical-trials-configMap.yml
   ```

2. Apply k8s deployment file
   ```
   kubectl apply -f ./k8s/clinical_trials_matching_api.yml
   ```
3. Forward a local port to a port on the Pod
   ```
   kubectl port-forward service/clinical-trials-matching 2333:2333
   ```
   Then you could see API page at  [http://localhost:2333/api-docs](http://localhost:2333/api-docs).