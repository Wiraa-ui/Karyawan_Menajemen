"use client";
import { useState, useEffect, useRef } from "react";

interface Option {
  id: number;
  nama: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | null;
  onChange: (value: number) => void;
  onAddNew?: (value: string) => Promise<void>;
  placeholder: string;
  className?: string;
  required?: boolean;
  name?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  onAddNew,
  placeholder,
  className = "",
  required = false,
  name,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.id === value);

  const filteredOptions =
    searchTerm.trim() === ""
      ? options
      : options.filter((opt) =>
          opt.nama.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleAddNew = async () => {
    if (!searchTerm.trim() || !onAddNew) return;
    const newName = searchTerm.trim();

    const alreadyExists = options.some(
      (opt) => opt.nama.toLowerCase() === newName.toLowerCase()
    );
    if (alreadyExists) return;

    try {
      await onAddNew(newName);
      setSearchTerm("");
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
    } finally {
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "" : "text-gray-400"}>
          {selectedOption ? selectedOption.nama : placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded shadow-lg max-h-60 overflow-auto">
          <div className="p-2 sticky top-0 bg-gray-700 border-b border-gray-600">
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-2 cursor-pointer hover:bg-gray-600 ${
                    option.id === value ? "bg-blue-600" : ""
                  }`}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.nama}
                </div>
              ))
            ) : searchTerm.trim() && onAddNew ? (
              <div className="p-2 text-center text-gray-400">
                Tidak ada hasil.
                <div
                  className="mt-2 text-blue-400 hover:text-blue-300 cursor-pointer"
                  onClick={handleAddNew}
                >
                  + Tambah unit {`"${searchTerm}"`}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {required && (
        <input
          type="hidden"
          name={name}
          value={value !== null ? value : ""}
          required
          aria-hidden="true"
        />
      )}
    </div>
  );
}
