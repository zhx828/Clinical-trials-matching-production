# Clinical Trials Matching Process

Clinical Trials Matching is developed by Python3, Node.js and AWS S3 bucket.

## Trials Matching with OncoKB Treatments

Set a corn job to run `python3 scripts/main.py` daily to update matched result and upload the result json file to AWS S3 bucket.

Note: **We need to config aws authentication first for uploading result to S3 bucket before run the matching script. Please go to [Boto3 Quick Start] for more details.**

## Matching Result API Service

### Development

Please run `npm start` for development and you can see API swagger page at [http://localhost:2333/api-docs](http://localhost:2333/api-docs).


### Production: Build and Upload docker images to Docker Hub
1.  Build docker image: 
    ```
    docker build -t clinical-trials-matching:[version] .
    ```
    You can run the command below to see if docker container works.
    ```
    docker run -p [port]:[port] -d clinical-trials-matching:[version]
    ``` 
2.  Tag image: 
    ```
    docker tag [imageID] cbioportal/clinical-trials-matching:[version]
    ```
3.  Push the image to Docker Hub:
    ```
    docker push cbioportal/clinical-trials-matching:[version]
    ```

[Boto3 Quick Start]: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html 
