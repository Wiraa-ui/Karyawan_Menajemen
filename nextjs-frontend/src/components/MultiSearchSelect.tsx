"use client";
import { useState, useEffect, useRef } from "react";

interface Option {
  id: number;
  nama: string;
}

interface MultiSearchSelectProps {
  options: Option[];
  values: number[];
  onChange: (values: number[]) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
  maxSelection?: number;
  onAddNew?: (value: string) => Promise<void>;
}

export default function MultiSearchSelect({
  options,
  values,
  onChange,
  placeholder,
  className = "",
  required = false,
  maxSelection = 2,
  onAddNew,
}: MultiSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItemMode, setNewItemMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setNewItemMode(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOptions = options.filter((option) =>
    values.includes(option.id)
  );

  const filteredOptions =
    searchTerm.trim() === ""
      ? options
      : options.filter((option) =>
          option.nama.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const toggleOption = (id: number) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else if (values.length < maxSelection) {
      onChange([...values, id]);
    }
    setSearchTerm("");
  };

  const handleAddNew = async () => {
    if (onAddNew && searchTerm.trim() !== "") {
      const namaBaru = searchTerm.trim();

      // Cek apakah sudah ada
      const alreadyExists = options.some(
        (opt) => opt.nama.toLowerCase() === namaBaru.toLowerCase()
      );
      if (alreadyExists) {
        return;
      }

      try {
        await onAddNew(namaBaru);
        setSearchTerm("");
      } catch (err) {
        console.error("Gagal tambah item:", err);
      } finally {
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white cursor-pointer min-h-[42px]"
        onClick={() => {
          if (!newItemMode) setIsOpen(!isOpen);
        }}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option) => (
              <div
                key={option.id}
                className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center"
              >
                <span>{option.nama}</span>
                <button
                  className="ml-1 text-white hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !newItemMode && (
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

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className={`p-2 cursor-pointer hover:bg-gray-600 ${
                  values.includes(option.id) ? "bg-blue-600" : ""
                }`}
                onClick={() => toggleOption(option.id)}
              >
                {option.nama}
              </div>
            ))
          ) : searchTerm.trim() !== "" && onAddNew ? ( // <-- perbaikan
            <div className="p-2 text-center text-gray-400">
              Tidak ada hasil.
              <div
                className="mt-2 text-blue-400 hover:text-blue-300 cursor-pointer"
                onClick={handleAddNew}
              >
                + Tambah jabatan {`&quot;${searchTerm}&quot;`}
              </div>
            </div>
          ) : null}

          {values.length >= maxSelection && (
            <div className="p-2 text-yellow-400 text-center border-t border-gray-600">
              Maksimal {maxSelection} pilihan
            </div>
          )}
        </div>
      )}

      {/* Hidden input untuk validasi HTML form */}
      {required && (
        <input
          type="hidden"
          value={values.length > 0 ? "valid" : ""}
          required
          aria-hidden="true"
        />
      )}
    </div>
  );
}
