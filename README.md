# Flow

Lightweight, fully-customizable image slider

## key features

* Lightweight
* Add your custom transition effects
* Built with ECMAScript, no jQuery
* Progress bar for the duration of the image
* Supports videos
* Touch friendly
* Vertical and horizontal sliding modes
* Special 3D pluin

[examples](https://baianat.github.io/flow/)

## Getting started

### Install

First step is to install it using yarn or npm

```bash
npm install @baianat/flow

# or use yarn
yarn add @baianat/flow
```

### Include necessary files

``` html
<head>
  <link rel="stylesheet" href="dist/css/flow.css">
</head>
<body>
    ...
    <script type="text/javascript" src="dist/js/flow.js"></script>
</body>
```

### HTML markup

For easy customization, you have to add any element you want in Flow

``` html
<!-- create div with class flow -->
<div class="flow" id="flow1">
  <!-- flow loader -->
  <div class="flow-loader"></div>
    <!-- add div with flow-slider class for each image -->
    <div class="flow-slide is-active">
      <!-- flow content -->
      <img src="dist/img/image-01.jpg" alt="" class="flow-image">
      <div class="flow-description">
        <h3>Awesome title here</h3>
        <p>Lorem ipsum dolor sit</p>
      </div>
    </div>
    <div class="flow-slide">
      <img src="dist/img/image-02.jpg" alt="" class="flow-image">
      <div class="flow-description">
        <h3>Awesome title here</h3>
        <p>Lorem ipsum dolor sit</p>
      </div>
    </div>
  ...

  <!-- slider indicators -->
    <ul class="flow-dots">
      <li><a class="flow-dot is-active"></a></li>
      <li><a class="flow-dot"></a></li>
      ...

    </ul>

    <!-- slider next arrow -->
    <a class="flow-next">
      <svg width="50" height="50" viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    </a>

    <!-- slider back arrow -->
    <a class="flow-back">
      <svg width="50" height="50" viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    </a>
</div>
```

Note: for next/back arrows, you can use any element you want inside them, either an `svg` icon or `font-icon`.

### Create a new Flow slider

```javaScript

new Flow('#flow1');

```

### Settings

| VARIABLE     | DEFAULT  | VALUES                       |
| -------------- | -------- | ---------------------------- |
| slideMode      | fading   | 'fading', 'sliding', 'falling', or your own custom mode |
| playTime       | 5000     | integer time in milliseconds |
| transitionTime | 600      | integer time in milliseconds |
| autoPlay       | true     | boolean                      |
| plugin         | null     | plugin object                |
| active3D       | false    | boolean                      |
| mode3D         | 1        | integer from 1 to 5          |
| slicesCount    | 4        | integer number               |
| events         | null     | object                       |

##Build your custom mode

You can create your own custom modes. e.g. Create a mode called `happy`

```javascript

new Flow('#flow1', {
  slideMode: 'happy'
});

```

In your stylesheet file, provide the transition property values for three states; entering, leaving and active

```css

.flow-happy.is-entering {
  transform: translate3d(-100%, 0, 0) rotate(300deg);
}
.flow-happy.is-leaving {
  transform: translate3d(100%, 0, 0) rotate(-300deg);
}
.flow-happy.is-active {
  transform: translate3d(0, 0, 0) rotate(-300deg);
}

```

## Enable 3D mode

First, you have to include `cube3D` plugin after `Flow`

```html

<body>
    ...
    <script type="text/javascript" src="dist/js/flow.js"></script>
    <script type="text/javascript" src="dist/js/cube3D.js"></script>
</body>

```

then pass the cube3D plugin to `Flow` settings object

```javaScript

new Flow('#flow2', {
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
