import { SepCon } from './../src/index';
import app from './app';
import Layout from './layouts/layout';
import './data/numbers';
import './data/site';
import './modifiers/pages';

document.getElementById('app').innerHTML = Layout.createTag().render();