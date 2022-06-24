//  variable to hold db connection
let db; 

//  we establish a connection to the db making a variable called request
const request = indexedDB.open("budget-tracker", 1);

// an event to trigger when the db version changes
request.onupgradeneeded = function(event) {
  // saves a reference to the db
  db = event.target.result;
  // creates a new object store called pending with an autoIncrementing primary key
  db.createObjectStore('pending', { autoIncrement: true });
};

//  if successful connection, then we trigger the following event
request.onsuccess = function(event) {
  // saves a reference to the db
  db = event.target.result;
  // if app is online upload pending transactions
  if (navigator.onLine) {
    checkDatabase();
  }
};

// if there is an error, then we trigger the following event
request.onerror = function(event) {
  console.log(event.target.errorCode);
}

// function to add transactions to the db if app is offline
function saveRecord(record) {
  // opens a transaction on the pending object store with readwrite access
  const transaction = db.transaction(['pending'], 'readwrite');
  // accesses the pending object store
  const store = transaction.objectStore('pending');

  // adds the record to the store
  store.add(record);
}