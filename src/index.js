import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import Map2D from "./Map";

const initState = {
    extent:[6734829.193000, 2692598.219300, 8849899.518100, 4509031.393100]

}

ReactDOM.render(<Map2D extent={initState.extent} />, document.getElementById('map-row'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
