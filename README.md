# Virtual Try-On Eyewear In React Using Tensorflow and Three.js

This project combines the power of React, TensorFlow.js, and Three.js to create an interactive and fun virtual try-on experience for eyewear. The goal is to enhance the online shopping experience, allowing users to try on sunglasses virtually from the comfort of their home.

![Virtual Try-On Demo](public/vto-promo.gif)

Live demo: https://react-vto.vercel.app/

## Project Overview

This application leverages TensorFlow for facial landmark detection within a video stream, React for building the user interface, and Three.js for placing and adjusting virtual sunglasses in real-time. The result is a seamless virtual try-on experience that mimics trying on glasses in person.

### Why 2D Images Over 3D Models?

In the world of ecommerce, especially eyewear, 3D models of products are not commonly available. Most online opticians have an extensive collection of 2D product photos. I decided to tackle this challenge head-on by using these readily available 2D images, making this virtual try-on feature more accessible and easier to implement for a wide range of eyewear retailers.

## Getting Started

### Prerequisites

- Node.js installed on your machine
- A basic understanding of React, TensorFlow.js, and Three.js

### Installation

- **Clone the repo** 
    ```git clone https://github.com/feridbrkovic/react-vto.git ```

- **Install NPM packages**
    ```npm install ```

- **Add your own ```path_to_your_glasses_image.png``` in the project directory to replace the placeholder in the code.**

- **Run the application**
    ```npm start run```

## Features

- Real-time face detection using TensorFlow.js
- Dynamic placement and adjustment of glasses on the user's face using Three.js
- Interactive and responsive design implemented with React

## Future Enhancements
- Integration of a more lightweight face detection model to improve performance, especially on mobile devices.
- Adding handles to the glasses with three.js to create a more interactive experience.
- Adding the ability to try on different styles of glasses through a user-friendly interface.