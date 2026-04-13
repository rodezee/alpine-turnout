import Turnout from '../alpine-turnout.js'

document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(Turnout);
});
