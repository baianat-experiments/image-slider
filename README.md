# Femto
Lightweight Customizable Slider
#### Current version: 0.0.1

## key features
- Lightweight
- Full Customizable
- Build with ECMAScript6 classes
- support videos
- Custom moods
- Special 3D plugin
[examples](https://baianat.github.io/femto/)




## How to use
#### include necessary files
``` html
<head>
  <link rel="stylesheet" href="dist/css/femto.css">
</head>
<body>
    ...
    <script type="text/javascript" src="dist/js/femto.js"></script>
</body>
```

#### HTML markup
for easy customization you have to add every element you want in slider
``` html
<!-- create div with class femto -->
<div class="femto" id="femto1">
  <!-- slider loader -->
  <div class="femto-loader"></div>
    <!-- add div with femto-slider class for each slide image -->
    <div class="femto-slide is-active">
      <!-- slider content -->
      <img src="dist/img/image-01.jpg" alt="" class="femto-image">
      <div class="femto-description">
        <h3>Awesome title here</h3>
        <p>Lorem ipsum dolor sit</p>
      </div>
    </div>
    <div class="femto-slide">
      <img src="dist/img/image-02.jpg" alt="" class="femto-image">
      <div class="femto-description">
        <h3>Awesome title here</h3>
        <p>Lorem ipsum dolor sit</p>
      </div>
    </div>
  ...

  <!-- slider indecators -->
    <ul class="femto-dots">
      <li><a class="femto-dot is-active"></a></li>
      <li><a class="femto-dot"></a></li>
      ...

    </ul>

    <!-- slider next arrow -->
    <a class="femto-next">
      <svg width="50" height="50" viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    </a>

    <!-- slider back arrow -->
    <a class="femto-back">
      <svg width="50" height="50" viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    </a>
</div>
```
not here for next/back arrows you can use any element you wany inside them either ```svg``` icon or ```font``` icon

#### Create new slider
``` javascript
new Femto('#femto1', settings);
```

#### Settings
| Property       | default  | values                       |
| -------------- | -------- | ---------------------------- |
| slideMode      | fading   | 'fading' 'sliding' 'falling' |
| playTime       | 5000     | integer time in milliseconds |
| transitionTime | 600      | integer time in milliseconds |
| autoPlay       | true     | boolean                      |
| plugin         | null     | plugin object                |
| active3D       | false    | boolean                      |
| mode3D         | 1        | integer from 1 to 5          |
| slicesCount    | 4        | integer number               |
| events         | null     | object                       |

#### Build your owen custom mode
you can create your custom mode as following
``` javascript
new Femto('#femto1', {slideMode = 'happy'});
```
in css file provide the transform for three states entering, leaving and active
``` css
.femto-happy.is-entering {
  transform: translate3d(-100%, 0, 0) rotate(300deg);
}
.femto-happy.is-leaving {
  transform: translate3d(100%, 0, 0) rotate(-300deg);
}
.femto-happy.is-active {
  transform: translate3d(0, 0, 0) rotate(-300deg);
}
```

#### Enable 3D mode
first you have to include ```cube3D``` plugin after ```femto```
``` html
<body>
    ...
    <script type="text/javascript" src="dist/js/femto.js"></script>
    <script type="text/javascript" src="dist/js/cube3D.js"></script>
</body>
```

then pass the options
``` javascript
new Femto('#femto2', {
    autoPlay: false,
    plugin: Cube3D,
    active3D: true,
    slicesCount: 6,
    mode3D: 1
});
```
## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017 [Baianat](http://baianat.com)
