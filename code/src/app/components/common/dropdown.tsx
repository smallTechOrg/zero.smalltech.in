'use client';
import { useEffect, useState } from 'react';
import { DropdownOption } from '@/app/models/dropdownOption';


interface DropdownProps<T> {
  label: string;
  options?: DropdownOption<T>[];
  fetchOptions?: () => Promise<DropdownOption<T>[]>;
  onSelect: (value: T) => void;
}

export default function Dropdown<T>({ label, options, fetchOptions, onSelect }: DropdownProps<T>) {
  const [internalOptions, setInternalOptions] = useState<DropdownOption<T>[]>(options ?? []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(label);

  useEffect(() => {
    setSelectedLabel(label);
  }, [label]);

  useEffect(() => {
    if (options && options.length) {
      setInternalOptions(options);
      return;
    }
    if (fetchOptions) {
      let alive = true;
      fetchOptions().then((opts) => {
        if (alive) setInternalOptions(opts);
      }).catch(console.error);
      return () => { alive = false; };
    }
  }, [options, fetchOptions]);

  const handleSelect = (option: DropdownOption<T>) => {
    setSelectedLabel(option.label);
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div className="">
      <button className="btnDropdown" onClick={() => setIsOpen(!isOpen)}>
        {selectedLabel} <span className="arrow">▾</span>
      </button>
      {isOpen && (
        <ul className="txt">
          {internalOptions.map((opt, idx) => (
            <li
              key={idx}
              className="listItem"
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
