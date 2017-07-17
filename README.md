<img alt="img" src="https://user-images.githubusercontent.com/102277/28255894-3f052692-6a82-11e7-8258-d8523f269d52.png">

# Ising Model WebGL

The [Ising Model](https://en.wikipedia.org/wiki/Ising_model) is a very interesting mathematical model describing the ferromagnetism of materials and is part of Statistical Mechanics in Physics.

The simulation is made using [Monte Carlo Method](https://en.wikipedia.org/wiki/Ising_model#Monte_Carlo_methods_for_numerical_simulation)


### WebGL 

The WebGL is made very simply using a shader that given an array of points it draws all points using GPU wich is much more effient than using the pixels and the HTML canvas. Of course you could solve the whole problem using the GPU context, as made [here](https://www.ibiblio.org/e-notes/Perc/ising.htm). I'm just learning WebGL and Shaders that's why I did this way.

References: 

* https://www.tutorialspoint.com/webgl/webgl_drawing_points.htm
* https://stackoverflow.com/questions/35444202/draw-a-single-pixel-in-webgl-using-gl-points
* https://www.ibiblio.org/e-notes/Perc/ising.htm


## Interface

I've been using [dat.gui](https://github.com/dataarts/dat.gui) for other project but it is not mobile friendly. I've found an experimental version [paper-gui](https://google.github.io/paper-gui/) made with Polymer paper elements and works very well.

* https://google.github.io/paper-gui/
* https://github.com/dataarts/dat.gui




