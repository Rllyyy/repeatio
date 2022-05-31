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
      "...": "..."
    }
  ]
}
```

**_[View Example](/public/data.json)_**

### Question Types

Create new question (object) inside the "questions" array.
JSON key-value pairs can not be empty, so for optional fields use an empty string `""`.

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

## Styling

Repeatio supports styling with `Markdown` and `HTML` for the following elements: **title**, **questionTypeHelp** and **answerOptions**.

<details>
  <summary><b>Line Breaks</b></summary>
  
  <p>Line breaks are significantly easier to use in html.</p>

  <table>
    <tr>
      <th>Type</th>
      <th>Markdown</th>
      <th>HTML</th>
      <th>Result</th>
    </tr>
    <tr>
      <td>Single line break</td>
      <td>Top Text <code>\n\n</code> New line</td>
      <td>Top Text <code>&lt;br /&gt;</code> New line</td>
      <td>Top Text <br />New line</td>
    </tr>
    <tr>
      <td>Multiple line break</td>
      <td>This text is broken into <code>\n\n &ampnbsp;&ampnbsp; \n\n</code> multiple lines </td>
      <td>This text is broken into <code>&lt;br /&gt;</code><code>&lt;br /&gt;</code>multiple lines</td>
      <td>This text is broken into <br /> <br /> multiple lines</td>
    </tr>
  </table>
</details>

<details>
  <summary><b>Emphasis (strong, italic, strikethrough, code, underline)</b></summary>

  <table>
    <tr>
      <th>Type</th>
      <th>Markdown</th>
      <th>HTML</th>
      <th>Result</th>
    </tr>
    <tr>
      <td>strong</td>
      <td><code>**text**</code></td>
      <td><code>&lt;b&gt;text&lt;/b&gt;</code></td>
      <td><b>text</b></td>
    </tr>
    <tr>
      <td>italic</td>
      <td><code>*text*</code> or <code>_text_</code></td>
      <td><code>&lt;i&gt;text&lt;/i&gt;</code></td>
      <td><i>text</i></td>
    </tr>
    <tr>
      <td>strong and italic</td>
      <td><code>**_text_**</code></td>
      <td><code>&lt;b&gt;&lt;i&gt;text&lt;/i&gt;&lt;/b&gt;</code></td>
      <td><b><i>text</i></b></td>
    </tr>
    <tr>
      <td>strikethrough</td>
      <td><code>~~text~~</code></td>
      <td><code>&lt;s&gt;text&lt;/s&gt;</code></td>
      <td><s>text</s></td>
    </tr>
    <tr>
      <td>code</td>
      <td><code>`text`</code></td>
      <td><code>&lt;code&gt;text&lt;/code&gt;</code></td>
      <td><code>text</code></td>
    </tr>
    <tr>
      <td>underline</td>
      <td></td>
      <td><code>&lt;u&gt;text&lt;/u&gt;</code></td>
      <td><u>text</u></td>
    </tr>
  </table>
</details>

<details>
  <summary><b>Lists</b></summary>

  <p>For a better readability the html lists in this example use line breaks. Remember that json doesn't allow line breaks, so everything needs to be in one line.</p>

  <table>
    <tr>
      <th>Type</th>
      <th>Markdown</th>
      <th>HTML</th>
      <th>Result</th>
    </tr>
    <tr>
      <td>Unordered List</td>
      <td><code>some text...\n - First unordered item\n - Another item\n - Last item\n\n</code><sup><a href="#footnote-html-1">[1]</a></sup></td>
      <td>

```html
some text...
<ul>
  <li>First unordered item</li>
  <li>Another item</li>
  <li>Last item</li>
</ul>
```

  </td>
      <td>
        <p>some text...</p>
        <ul>
          <li>First unordered list item</li>
          <li>Another item</li>
          <li>Last item</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Ordered List</td>
      <td><code>some text...\n 1. First ordered item\n 2. Another item\n 3. Last item\n\n</code><sup><a href="#footnote-html-2">[2]</a></sup></td>
      <td>

```html
some text...
<ol>
  <li>First ordered list item</li>
  <li>Another item</li>
  <li>Last item</li>
</ol>
```

  </td>
      <td>
        <p>some text...</p>
        <ol>
          <li>First ordered list item</li>
          <li>Another item</li>
          <li>Last item</li>
        </ol>
      </td>  
    </tr>
  </table>
  <p id="footnote-html-1">[1]: Unordered list can use asterisks (<code>*</code>), minuses (<code>-</code>) or pluses (<code>+</code>). Don't forget the <code>\n</code> after each list item (+before the list) and <code>/n/n</code> to exit the list if there is any content after it!</p>
  <p id="footnote-html-2">[2]: Actual numbers don't matter, just that it's a number. Don't forget the <code>\n</code> after each list item (+before the list) and <code>/n/n</code> to exit the list if there is any content after it!</p>

</details>

<details>
  <summary><b>Tables</b></summary>

  <p>For a better readability the html table in this example use line breaks. Remember that json doesn't allow line breaks, so everything needs to be in one line.</p>

  <table>
    <tr>
      <th>Type</th>
      <th>Markdown</th>
      <th>HTML</th>
      <th>Result</th>
    </tr>
    <tr>
      <td>Table</td>
      <td><pre>some text...\n
| Heading 1 | Heading 2 |\n
| --------- | ----------- |\n
| Item 1    | Item 2 |\n
| Item 3    | Item 4 |\n\n </pre>
      <sup>
        <a href="#footnote-html-3">[3]</a>
        </sup>
      </td>
      <td>

```html
some text...
<table>
  <tr>
    <th>Heading 1</th>
    <th>Heading 2</th>
  </tr>
  <tr>
    <td>Item 1</td>
    <td>Item 2</td>
  </tr>
  <tr>
    <td>Item 3</td>
    <td>Item 4</td>
  </tr>
</table>
```

</td>
      <!-- Result -->
      <td>
        <p>some text...</p>
        <table>
          <tr>
            <th>Heading 1</th>
            <th>Heading 2</th>
          </tr>
          <tr>
            <td>Item 1</td>
            <td>Item 2</td>
          </tr>
          <tr>
            <td>Item 3</td>
            <td>Item 4</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <span id="footnote-html-3">[3]: Use the following syntax to align items in a markdown table (below the heading):
  <ul>
  <li><i>left</i> (<code>| :------- |</code>) is optional as it is identical to <code>| ------- |</code> </li><li><i>center</i> (<code>| :-------: |</code>)</li><li><i>right</i> (<code>| -------: |</code>)</li>
  </ul>
  </span>

</details>

<details>
  <summary><b>Math (LaTeX/KaTeX)</b></summary>

Repeatio uses KaTeX/LaTeX to render mathematical functions.
**[Here](/.github/Docs/KaTeX.md)** is a detailed guide.

Generally replace every single slash `\` with `\\` and use line breaks to separate the function (`\n\n` or `<br />`).

</details>

## General .json

- Fields can not be empty (provide an empty string instead)
- Normal quotes don't work (`"text"`) use unicode U+201E/U+201C instead (`„text“`) or escape the string like this `\"text\"`
- .json key-value properties have to be separated by a comma from the next one
- The .json key value (left side of a property) has to be a string
