# face-api-demo
Code provided in fulfilment of Module 3 Assignment on the edX [Asynchronous Programming with Javascript](https://courses.edx.org/courses/course-v1:Microsoft+DEV234x+3T2017a/course/) course.

## Usage
This probably isn't safe to use in production as there's no sanitisation of input anywhere 😥

To get it running locally, sign up for a Face Recognition key at the [Microsoft Cognitive API site](https://azure.microsoft.com/en-us/services/cognitive-services/face/). Then adjust the two constants at the top of `faceAnalytics.js`.

## Development
If you have NPM, there is a package.json that pulls in eslint as a development dependency when you run `npm install`. You can therefore use `npm run lint` to lint the JavaScript file. Your IDE may support this as well.
