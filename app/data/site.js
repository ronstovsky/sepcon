import { SepCon } from '../../src/index';

export default SepCon.createData('site', {
    currentPage: {
        id: null
    },
    pages: {
        home: {
            title: 'Home',
            description: 'Welcome to here',
            url: ''
        },
        flux: {
            title: 'Flux',
            description: 'Modifiers vs. Data',
            url: 'flux'
        },
        externals: {
            title: 'Externals',
            description: 'Passing props and methods',
            url: 'externals'
        },
    }
});