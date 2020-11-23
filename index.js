// ** METHODS FOR ARRAY STATE **

exports.addItemToStateArray = addItemToStateArray;
exports.deleteItemFromStateArray = deleteItemFromStateArray;
exports.deleteItemFromStateArrayByMongoId = deleteItemFromStateArrayByMongoId;

exports.setStateObjectProperty = setStateObjectProperty;
exports.incrementDecrementStateObjectProperty = incrementDecrementStateObjectProperty;

function addItemToStateArray(stateArray, setStateArray, item) {
  if (
    !handleArrayShouldNotContainTargetItemValidation(
      stateArray,
      item,
      getFunctionName()
    )
  ) {
    return;
  }

  const updatedArray = [...stateArray];
  updatedArray.push(item);

  setStateArray(updatedArray);
}

function deleteItemFromStateArray(
  stateArray,
  setStateArray,
  item,
  single = true
) {
  if (
    !handleArrayShouldContainTargetItemValidation(
      stateArray,
      item,
      getFunctionName()
    )
  ) {
    return;
  }
  let updatedArray;

  // Makes sure that the user of the funciton can specify removing a single iteration, or all iterations
  if (single) {
    let found = false;
    updatedArray = stateArray.filter((value) => {
      if (value === item) {
        if (found) {
          return true;
        }

        found = true;
        return false;
      }
      return true;
    });
  } else {
    updatedArray = stateArray.filter((value) => value !== item); // Ensures this list doesn't include the item to be deleted.
  }

  setStateArray(updatedArray);
}

function deleteItemFromStateArrayByMongoId(stateArray, setStateArray, id) {
  if (!isNaN(id)) {
    // ID is a number. Let's convert
    id = id.toString();
  }

  const updatedArray = stateArray.filter((value) => value._id !== id); // Ensures this list doesn't include the item to be deleted.

  setStateArray(updatedArray);
}

// ** METHODS FOR OBJECT STATE **

function setStateObjectProperty(stateObject, setStateObject, key, value) {
  if (!handleStateObjectValidation(stateObject, getFunctionName())) {
    return;
  }

  /* 
  Using shallow copy for simplicity. Don't want to use a library
  Perhaps will change this in the future if necessary.
  */

  const stateObjectCopy = { ...stateObject };
  stateObjectCopy[key] = value;

  setStateObject(stateObjectCopy);
}

function incrementDecrementStateObjectProperty(
  stateObject,
  setStateObject,
  key,
  amount = 1
) {
  if (
    !handleStateObjectShouldContainTargetPropertyWithNumberValueValidation(
      stateObject,
      key,
      getFunctionName()
    )
  ) {
    return;
  }

  /* 
  Using shallow copy for simplicity. Don't want to use a library
  Perhaps will change this in the future if necessary.
  */

  const previousNumberValue = stateObject[key];

  const previousIsString = typeof previousNumberValue !== "number";
  const amountIsString = typeof amount !== "number";

  const newValue =
    (previousIsString ? parseInt(previousNumberValue) : previousNumberValue) +
    (amountIsString ? parseInt(amount) : amount);

  const stateObjectClone = { ...stateObject };

  stateObjectClone[key] = previousIsString ? newValue.toString() : newValue;

  setStateObject(stateObjectClone);
}

// ** ARRAY VALIDATION METHODS **

// Returns true is validation was successful, false otherwise.
function handleArrayValidation(inputArray, functionName) {
  if (!Array.isArray(inputArray)) {
    // Given state variable is a not an array variable. Return here and log error.
    console.error(
      `Call to ${functionName} provides a non-array state variable! State Variable: ${inputArray}`
    );
    return false;
  }

  return true;
}

// Returns true is validation was successful, false otherwise.
function handleArrayShouldContainTargetItemValidation(
  inputArray,
  item,
  functionName
) {
  if (!handleArrayValidation(inputArray, functionName)) {
    return false;
  }

  if (!inputArray.includes(item)) {
    // Target item is not in the array. Return here and log error.
    console.error(
      `Call to ${functionName} provides an array without target item! Target item: ${item}`
    );
    return false;
  }

  return true;
}

// Returns true is validation was successful, false otherwise.
function handleArrayShouldNotContainTargetItemValidation(
  inputArray,
  item,
  functionName
) {
  if (!handleArrayValidation(inputArray, functionName)) {
    return false;
  }

  if (inputArray.includes(item)) {
    // Target item is in the array. Return here and log error.
    console.error(
      `Call to ${functionName} provides an array with target item already! Target item: ${item}`
    );
    return false;
  }

  return true;
}

// ** OBJECT VALIDATION METHODS **

function handleStateObjectValidation(inputObject, functionName) {
  if (typeof inputObject !== "object" || inputObject === null) {
    // Given state variable is a not an object variable. Return here and log error.
    console.error(
      `Call to ${functionName} provides a non-object state variable! State Variable: ${inputObject}`
    );
    return false;
  }

  return true;
}

function handleStateObjectShouldContainTargetPropertyValidation(
  inputObject,
  key,
  functionName
) {
  if (!handleStateObjectValidation(inputObject, functionName)) {
    return;
  }

  if (!inputObject.hasOwnProperty(key)) {
    console.error(
      `Call to ${functionName} provides an object without target property! Target property: ${key}`
    );
    return false;
  }

  return true;
}

function handleStateObjectShouldContainTargetPropertyWithNumberValueValidation(
  inputObject,
  key,
  functionName
) {
  if (
    !handleStateObjectShouldContainTargetPropertyValidation(
      inputObject,
      key,
      functionName
    )
  ) {
    return false;
  }

  const targetValue = inputObject[key];

  if (isNaN(targetValue)) {
    console.error(
      `Call to ${functionName} provides an object with target property containing a non-number value! Target property value: ${targetValue}`
    );
    return false;
  }

  return true;
}

// ** VALIDATION HELPER METHODS **

function getFunctionName() {
  return "-production-build-";
  // if (process.env.NODE_ENV === "development") {
  //   return getFunctionName.caller.name;
  // }
}
