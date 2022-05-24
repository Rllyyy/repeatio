# repeatio

_Learn, repeat, memorize tasks with repeatio._

## Adding an existing Module

1. Click on ```Add Module``` in the overview
2. Select the file ```data.json```

## Creating a new Module

It is generally advised to use a code editor like VS Code or Atom to create or edit module files as one wrong value breaks the whole application.
These programs provide feedback for potential problems.

### Module file structure

```json
{
  "id": "MOD01",
  "name": "Module Name",
  "questions": [
    {
      "id": "MOD01-1",
      ...
    }
  ]
}
```

**_[View Example](/public/data.json)_**

### Question Types

Create new question (object) inside the "questions" array.
JSON key-value pairs can not be empty, so for optional fields use empty string "".

**_Fields:_**
| Field                   |                   Description                          | value type   |  required?   |
|------------------------ |:------------------------------------------------------:|:------------:| ------------:|
| ```id```                |  The id of the questions (has to be unique)            | string       |      yes     |
| ```title```             |  The title of the question                             | string       |      no      |
| ```points```            |  Max point value of a question                         | number / "?" |      no      |
| ```type```              |  The type of the question                              | string       |      yes     |
| ```questionTypeHelp```  |  Explain what the user needs to do                     | string       |      no      |
| ```answerOptions```     |  The part of the question that the user interacts with | array/object |      no      |

**_Types:_**

<details>
  <summary><b>Multiple-Choice</b></summary>

  <p>Multiple-Choice questions have <b>exactly one</b> correct answer and are characterized by a circle in front of each option.<p>

  <i><b>.json:</b></i>

  ```json
  {
    "id": "MOD01-1",
    "title": "This question is of the type Multiple-Choice. Exactly _**one**_ correct answer must be selected. A circle in front of each option can help to identify this kind of question. How many options can be correct?",
    "points": 5,
    "type": "multiple-choice",
    "questionTypeHelp": "Please choose the correct answer.",
    "answerOptions": [
      {
        "id": "option-0",
        "text": "All options can be correct",
        "isCorrect": false
      },
      {
        "id": "option-1",
        "text": "One or more options can be correct",
        "isCorrect": false
      },
      {
        "id": "option-2",
        "text": "No option can be correct",
        "isCorrect": false
      },
      {
        "id": "option-3",
        "text": "Exactly one option can be correct",
        "isCorrect": true
      }
    ]
  }
  ```

</details>

<details>
  <summary><b>Multiple-Response</b></summary>

  <p>Multiple-Response questions can have <b>multiple</b> correct answers and are characterized by a square in front of each option.<p>

  <b><i>.json:</i></b>

  ```json
  {
    "id": "MOD01-2",
    "title": "Multiple Response questions have _**at least one**_ correct answer. This type of question is represented by a square in front of each option. <br /> Please note that _**all**_ correct options must be selected, otherwise there will be no points awarded.<br /> How many options can be correct?",
    "points": 5,
    "type": "multiple-response",
    "questionTypeHelp": "Please choose the correct answer(s).",
    "answerOptions": [
      {
        "id": "option-0",
        "text": "All options can be correct",
        "isCorrect": true
      },
      {
        "id": "option-1",
        "text": "One or more options can be correct",
        "isCorrect": true
      },
      {
        "id": "option-2",
        "text": "No option can be correct",
        "isCorrect": false
      },
      {
        "id": "option-3",
        "text": "One option can be correct",
        "isCorrect": true
      },
      {
        "id": "option-4",
        "text": "This question type is identical with Multiple-Choice questions",
        "isCorrect": false
      },
      {
        "id": "option-5",
        "text": "Half points can be awarded if 50% of the options are correct",
        "isCorrect": false
      }
    ]
  }
  ```

</details>

<details>
  <summary><b>Gap Text</b></summary>

  <p>Gap Text questions require the user to fill in the missing words. A gap is created by a square bracket.<p>

  <b><i>.json:</i></b>

  ```json
  {
    "id": "MOD-3",
    "title": "This is a question of the type gap text. Each gap has to be filled with the correct word.<br /> Please note that spelling mistakes are _**not tolerated**_ but partial points are awarded for a correct gap.<br /> If different words are correct for one gap, you only need to input one but the correction will show all separated by a semicolon (;). The following text has three gaps that have to be filled.",
    "points": 5,
    "type": "gap-text",
    "questionTypeHelp": "Fill in the blanks.",
    "answerOptions": {
      "text": "A gap text question can have multiple []. A [] separates the correct words for one gap. When answering a question the user has to use the correct spelling because spelling mistakes are [] tolerated.",
      "correctGapValues": [
        [
          "gaps"
        ],
        [
          "semicolon",
          ";"
        ],
        [
          "not"
        ]
      ]
    }
  }
  ```

</details>

<details>
  <summary><b>Gap Text Dropdown</b></summary>

  <p>The question type Gap Text Dropdown requires the user to select the correct answer for a gap from a dropdown list. A gap is created by a square bracket.<p>

  <b><i>.json:</i></b>

  ```json
  {
    "id": "MOD01-4",
    "title": "This is a question of the type gap text with preselected values for each gap. Each gap is rated independently, meaning that part points are possible. Choose the correct values for each gap in the following text.",
    "points": 5,
    "type": "gap-text-dropdown",
    "questionTypeHelp": "Fill in the blanks with the **correct** Values!",
    "answerOptions": {
      "text": "Possible values for each gap can be selected from a []-list. If the user answers 50% of the gaps correctly, he will be awarded [] of the points.",
      "dropdowns": [
        {
          "id": "select-0",
          "options": [
            "Dropdown",
            "Pickup",
            "empty"
          ],
          "correct": "Dropdown"
        },
        {
          "id": "select-1",
          "options": [
            "0%",
            "25%",
            "50%",
            "75%",
            "100%"
          ],
          "correct": "50%"
        }
      ]
    }
  }
  ```

</details>

<details>
  <summary><b>Extended-Match</b></summary>

  <p>Connect the dots with the extended-match question type.<p>

  <b><i>.json:</i></b>

  ```json
  {
    "id": "MOD01-5",
    "title": "This is a question of the type Extended Match. The values of the left side have to be connected to the values of the right side but not all values have to be connected. A value can be selected by clicking on the circle. Dragging is currently not supported.<br /> Please note that _**all**_ correct options must be connected, otherwise there will be no points awarded. Please connect the following values.",
    "points": 5,
    "type": "extended-match",
    "questionTypeHelp": "Connect the dots.",
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

</details>

## General .json

- Fields can not be empty (provide an empty string instead)
- Normal quotes don't work (```"text"```) use unicode U+201E/U+201C instead (```„text“```) or escape the string like this ```\"text\"```
- .json key-value properties have to be separated by a comma from the next one
- The .json key value (left side of a property) has to be a string
