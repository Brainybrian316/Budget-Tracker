//*  variable to hold db connection
let db; 

// * we establish a connection to the db making a variable called request
const request = indexedDB.open("budget-tracker", 1);