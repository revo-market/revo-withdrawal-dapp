import React, {useState} from 'react';

interface DropdownProps<T extends string> {
  options: T[];
  onChange: (value: T) => void;
  label?: string;
}

function Dropdown<T extends string>({options, onChange, label}: DropdownProps<T>) {
  const [selected, setSelected] = useState(options[0])

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value as T
    setSelected(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-48">
      {label && <label htmlFor="custom-dropdown" className="block mb-2 text-sm text-white">{label}</label>}
      <select
        id="custom-dropdown"
        value={selected}
        onChange={handleSelect}
        className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
