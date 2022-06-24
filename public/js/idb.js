//  variable to hold db connection
let db;

//  we establish a connection to the db making a variable called request
const request = indexedDB.open('budget-tracker', 1);

// an event to trigger when the db version changes
request.onupgradeneeded = function (event) {
  // saves a reference to the db
  db = event.target.result;
  // creates a new object store called pending with an autoIncrementing primary key
  db.createObjectStore('pending', { autoIncrement: true });
};

//  if successful connection, then we trigger the following event
request.onsuccess = function (event) {
  // saves a reference to the db
  db = event.target.result;
  // if app is online upload pending transactions
  if (navigator.onLine) {
    checkDatabase();
  }
};

// if there is an error, then we trigger the following event
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// function to add transactions to the db if app is offline
function saveRecord(record) {
  // opens a transaction on the pending object store with readwrite access
  const transaction = db.transaction(['pending'], 'readwrite');
  // accesses the pending object store
  const store = transaction.objectStore('pending');

  // adds the record to the store
  store.add(record);
}

// function to upload pending transactions to server if app is online
function checkDatabase() {
  //  opens a transaction on db with readwrite access
  const transaction = db.transaction(['pending'], 'readwrite');
  // accesses the pending object store and stores it in a variable called store
  const store = transaction.objectStore('pending');
  // gets all records from the store and stores it in a variable called getAllStores
  const getAllStores = store.getAll();

  // if there are records in the store, then we trigger the following event
  getAllStores.onsuccess = function () {
    // if there are records in the store, then we trigger the following event
    if (getAllStores.result.length > 0) {
      // loop through all of the records in the store and upload them to the server
      getAllStores.result.forEach((record) => {
        // create a fetch request to the server
        fetch('/api/transaction', {
          //  this is the method we are using to send data to the server
          method: 'POST',
          // this is the data we are sending to the server
          body: JSON.stringify(record),
          // this is the type of data we are sending to the server
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          // the response is the server's response to the request we made for the data
          .then((response) => {
            // we return the response to the server
            return response.json();
          })
          .then((data) => {
            // if errors we use windows message event to display error
            if (data.message) {
              throw new Error(data);
            }

            //  opens a transaction on the pending object store with readwrite access
            const transaction = db.transaction(['pending'], 'readwrite');

            // access the pending object store
            const store = transaction.objectStore('pending');

            // removes all the records from the store
            store.clear(); // clear removes all the elements from a set

            // if successful, then we trigger the following event and display a message to the user
            alert('Your transactions have now been saved');
          })
          // if there is an error, then we trigger the following event
          .catch((err) => {
            console.log(err);
          });
      });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
