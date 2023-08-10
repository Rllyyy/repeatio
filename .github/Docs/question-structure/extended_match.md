# Extended Match

Connect the dots with the extended-match question type.

**_JSON:_**
```json
{
  "id": "qID-5",
  "title": "This is a question of the type Extended Match. The values of the left side have to be connected to the values of the right side but not all values have to be connected. A value can be selected by clicking on the circle. Dragging is currently not supported.<br /> Please note that _**all**_ correct options must be connected, otherwise there will be no points awarded. Please connect the following values.",
  "points": 5,
  "type": "extended-match",
  "help": "Connect the dots.",
  "answerOptions": {
    "leftSide": [
      {
        "id": "left-0",
        "text": "Hello"
      },
      {
        "id": "left-1",
        "text": "7+4"
      }
    ],
    "rightSide": [
      {
        "id": "right-0",
        "text": "World"
      },
      {
        "id": "right-1",
        "text": "20"
      },
      {
        "id": "right-2",
        "text": "11"
      }
    ],
    "correctMatches": [
      {
        "left": "left-0",
        "right": "right-0"
      },
      {
        "left": "left-1",
        "right": "right-2"
      }
    ]
  }
}
```

**_[Result](https://repeatio.netlify.app/module/types_1/question/qID-5?mode=practice&order=chronological)_**
