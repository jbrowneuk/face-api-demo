const ANALYTICS_API_KEY = 'API_KEY_GOES_HERE';
const ANALYTICS_API_REGION = 'westcentralus';

let lastUrl = '';

/**
 * Convenience function to format person details.
 */
function formatPersonInfo(person) {
  // Calculate the 'strongest' emotion. This enumerates the properties of the
  // emotion object and picks the one with the highest numeric value.
  const { emotion } = person;
  const strongestEmotion = { name: 'nothing', value: 0 };
  const emotionProperties = Object.keys(emotion);
  emotionProperties.forEach((key) => {
    const value = emotion[key];
    if (value > strongestEmotion.value) {
      strongestEmotion.name = key;
      strongestEmotion.value = value;
    }
  });

  return `This person is ${person.gender} and ${person.age} years old. They appear to be feeling ${strongestEmotion.name}.`;
}

/**
 * Function called when the face recognition API returns a response with code 200-299.
 */
function handleImageApiResponse(response) {
  const outputArea = document.getElementById('output');
  outputArea.className = 'loaded';

  // Sanity check
  if (!Array.isArray(response) || response.length === 0) {
    document.getElementById('output').innerHTML = 'No faces detected';
    return;
  }

  const hasMultiplePeople = response.length > 1;
  if (!hasMultiplePeople) {
    outputArea.innerHTML = formatPersonInfo(response[0].faceAttributes);
    return;
  }

  const topParagraph = document.createElement('p');
  topParagraph.innerHTML = `Found ${response.length} people:`;
  outputArea.appendChild(topParagraph);

  const listContainer = document.createElement('ol');
  outputArea.appendChild(listContainer);

  response.forEach((person) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = formatPersonInfo(person.faceAttributes);
    listContainer.appendChild(listItem);
  });
}

/**
 * Function called to send a POST request to the face recognition API using an
 * image that can be found at the provided URL.
 */
function analyzeFaceFromUrl(imageUrl) {
  const reqBody = {
    url: imageUrl,
  };

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': ANALYTICS_API_KEY,
  });

  const initObject = {
    method: 'POST',
    body: JSON.stringify(reqBody),
    headers,
  };

  const baseEndpointUrl = `https://${ANALYTICS_API_REGION}.api.cognitive.microsoft.com/face/v1.0/detect`;
  const facialAttributes = 'age,gender,emotion';
  const endpointUrl = `${baseEndpointUrl}?returnFaceAttributes=${facialAttributes}`;
  const request = new Request(endpointUrl, initObject);

  const outputArea = document.getElementById('output');
  outputArea.className = 'loading';

  fetch(request).then((response) => {
    if (response.ok) {
      return response.json();
    }

    return Promise.reject(new Error(response.statusText));
  }).then((response) => {
    handleImageApiResponse(response);
  }).catch((err) => {
    alert(err);
    lastUrl = ''; // Allow reanalysis using the same URL
    outputArea.innerHTML = 'No Faces Detected';
    outputArea.className = 'error';
  });
}

/**
 * Gets the url provided by the user in the input area.
 */
function getInputUrl() {
  let url = document.getElementById('input').value;
  if (url.length === 0) {
    alert('Please enter a URL to an image.');
    return '';
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }

  return url;
}

/**
 * Removes all child elements from a provided element.
 */
function emptyContentsOfElement(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}

/**
 * Wrapper function that invokes the other functions in this file.
 */
function analyzeWrapper() {
  const url = getInputUrl();
  // Don't hit the API if it's the same image, or if the URL provided is blank
  if (lastUrl === url || url === '') {
    return;
  }

  lastUrl = url;

  // Clear image container
  const imageContainerElement = document.getElementById('image-area');
  emptyContentsOfElement(imageContainerElement);

  // Create image element and append to container
  const imageElement = document.createElement('img');
  imageElement.src = url; // Security issue here; don't use in production
  imageElement.classList = 'img-fluid';
  imageContainerElement.appendChild(imageElement);

  // Clear attributes area
  const outputAreaElement = document.getElementById('output');
  emptyContentsOfElement(outputAreaElement);

  analyzeFaceFromUrl(url);
}

document.getElementById('analyse-button').addEventListener('click', analyzeWrapper);
