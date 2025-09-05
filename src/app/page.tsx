"use client";

import { useEffect, useState } from "react";
import * as yup from "yup";

type FieldType = "text" | "email" | "number";

interface Field {
  id: string;
  type: FieldType;
  value: string;
  error?: string;
}

const getValidationSchema = (type: FieldType) => {
  switch (type) {
    case "email":
      return yup.string().email("Invalid email").required("Required");
    case "number":
      return yup
        .number()
        .typeError("Must be a number")
        .moreThan(0, "Must be greater than 0")
        .required("Required");
    default:
      return yup.string().required("Required");
  }
};

export default function Home() {
  const [fields, setFields] = useState<Field[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("formFields");
    if (saved) setFields(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("formFields", JSON.stringify(fields));
  }, [fields]);

  const addField = (type: FieldType) => {
    setFields([...fields, { id: crypto.randomUUID(), type, value: "" }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = async (id: string, value: string, type: FieldType) => {
    let error = "";
    try {
      const schema = getValidationSchema(type);
      await schema.validate(value);
    } catch (err: any) {
      error = err.message;
    }

    setFields(fields.map(f => (f.id === id ? { ...f, value, error } : f)));
  };

  const clearForm = () => {
    setFields([]);
    localStorage.removeItem("formFields");
    setShowPreview(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-xl w-full p-6 bg-white shadow rounded-lg space-y-4">
        <h1 className="text-2xl font-bold text-black">Dynamic Form Builder</h1>

        {/* Buttons to add fields */}
        <div className="flex gap-2">
          <button
            onClick={() => addField("text")}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add Text
          </button>
          <button
            onClick={() => addField("email")}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add Email
          </button>
          <button
            onClick={() => addField("number")}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add Number
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.id} className="flex flex-col gap-1 p-2 border rounded">
              <div className="flex gap-2">
                <input
                  min={1} 
                  type={f.type}
                  value={f.value}
                  placeholder={`Enter ${f.type}`}
                  onChange={(e) => updateField(f.id, e.target.value, f.type)}
                  className="border p-2 rounded w-full text-black"
                />
                <button
                  onClick={() => removeField(f.id)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  ✕
                </button>
              </div>
              {f.error && <p className="text-red-500 text-sm">{f.error}</p>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
          <button
            onClick={clearForm}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-6 border rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold mb-2 text-black">Form Preview</h2>
            <ul className="space-y-2">
              {fields.map(f => (
                <li key={f.id} className="border p-2 rounded text-black">
                  <strong>{f.type}:</strong> {f.value || <em>(empty)</em>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
