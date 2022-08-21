export const EditorFormInput = ({ labelText, type, value, handleChange, ...props }) => {
  const preventSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className={`modal-question-${labelText}`}>
      <label htmlFor={`modal-question-${labelText}-input`}>{labelText}</label>
      <input
        name={labelText.toLowerCase()}
        type={type}
        id={`modal-question-${labelText}-input`}
        value={value || ""}
        onChange={handleChange}
        onKeyDown={preventSubmit}
        {...props}
      />
    </div>
  );
};
