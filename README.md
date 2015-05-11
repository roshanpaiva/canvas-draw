
## Steps to install and test it out
* Install NodeJS (http://nodejs.org/)
* Extract the zip and go into the folder (cd canvas-draw)
* Execute "npm install" (this should download the required libraries)
* Once that¹s done. Run it by executing "node app.js"
* Launch a browser and point it to http://localhost:3000/

The main code is in the drawview.js. This has all the code for smoothening
the curves etc.
The canvas is in the draw.jade file.

I've used backbonejs - its not necessary. I've used it purely because we
leverage backbone for MVC. If you would like me to give you a
simple js version I could (just need a little time :) ).
I've also used jade templates - this is for html templates.. Not
necessary. Its finally compiled to html anyways.

I've tested this on firefox and chrome. Didn't get a chance to test it on
IE.

### Notes:
- There are a couple of variables you can play around with.
  Max width - when you're drawing depending on the velocity, whats the
maximum width of the line
  Min width - same as above.
  Render options: faster thinner = this is more like a pen where as your
draw faster, the ink is thinner
      Faster thicker = this is like the effect on Paper (app for iPad)
      Marker - fixed width

- There are a few more variables that are hidden - open up draw.jade and
you can unhide them. The values I've left them at are what I think are the
optimum. Feel free to play around with it tho.

Let me know if you have any questions.
