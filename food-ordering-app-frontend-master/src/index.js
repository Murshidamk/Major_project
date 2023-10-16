import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import FoodOrderingApp from "./FoodOrderingApp";
import {BrowserRouter as Router} from "react-router-dom";


ReactDOM.render(
    <Router>
        <FoodOrderingApp/>
    </Router>,
    document.getElementById('root')
);

serviceWorker.unregister();
