/**
 * Copyright 2013-2021 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses services workers so it will work offline.
 *
 * Created using React JS.
 *
 * @version 5.4.0
 */
import React from "react";
import ReactDOM from "react-dom";
import App from "./app"

ReactDOM.render(<App />, document.getElementById('root'));

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('service-worker.js');
}
