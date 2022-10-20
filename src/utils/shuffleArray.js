//Randomize the order of an array
//https://stackoverflow.com/questions/38101522/how-to-render-random-objects-from-an-array-in-react (Fisher-Algorithm)
export function shuffleArray(array) {
  let index = array.length - 1;
  for (index; index > 0; index--) {
    const j = Math.floor(Math.random() * (index + 1));
    const temp = array[index];
    array[index] = array[j];
    array[j] = temp;
  }
  return array;
}
