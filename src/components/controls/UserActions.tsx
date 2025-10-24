import { useEffect, useState } from "react";
import Button from "../atoms/Button";
import type { CpuController } from "../../engine/controllers/CpuController";
import type { CacheType } from "../../engine/controllers/CacheController"
import TextField from "../atoms/TextField";
import {
  binary4BitToHex,
  binToHex,
  hexTo4BitBinary,
  hexToBin,
  parseHexAddress,
  parseHexAssociativeAddress,
  randomHexChar,
} from "../../utils/convert";

interface UserActionsProps {
  cpu: CpuController;
  cacheType: CacheType;
  onCacheTypeChange: (type: CacheType) => void;
}

// Constantes para validación
const VALIDATION_RULES = {
  hex: {
    maxLength: 6,
    pattern: /^[0-9A-Fa-f]*$/,
    errorMessage: "Solo se permiten caracteres hexadecimales (0-9, A-F)",
  },
  bin: {
    maxLength: 24,
    pattern: /^[01]*$/,
    errorMessage: "Solo se permiten 0 y 1",
  },
  tag: {
    maxLength: 2, // 8 bits en hexadecimal
    pattern: /^[0-9A-Fa-f]*$/,
    errorMessage: "Solo caracteres hexadecimales (0-9, A-F)",
  },
  bigtag: {
    maxLength: 6, // 22 bits en hexadecimal
    pattern: /^[0-9A-Fa-f]*$/,
    errorMessage: "Solo caracteres hexadecimales (0-9, A-F)",
  },
  line: {
    maxLength: 4, // 14 bits en hexadecimal (máximo 3 caracteres hex para 14 bits)
    pattern: /^[0-9A-Fa-f]*$/,
    errorMessage: "Solo caracteres hexadecimales (0-9, A-F)",
  },
  word: {
    maxLength: 1, // 2 bits en hexadecimal
    pattern: /^[0-3]*$/,
    errorMessage: "Solo valores entre 0-3 (2 bits)",
  },
  set: {
    maxLength: 4, // 14 bits en hexadecimal
    pattern: /^[0-9A-Fa-f]*$/,
    errorMessage: "Solo caracteres hexadecimales (0-9, A-F)",
  },
};

export const UserActions = ({
  cpu,
  cacheType = "direct",
  onCacheTypeChange,
}: UserActionsProps) => {
  const [associativeInput, setAssociativeInput] = useState({
    bigtag: "",
    word: "",
    hex: "",
    bin: "",
  });
  const [gAssociativeInput, setGAssociativeInput] = useState({
    tag: "",
    set: "",
    word: "",
    hex: "",
    bin: "",
  });
  const [directInput, setDirectInput] = useState({
    tag: "",
    line: "",
    word: "",
    hex: "",
    bin: "",
  });

  // Estados para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDisabled = cpu.hasNext();

  const getCurrentInput = (_cacheType = cacheType) =>
    _cacheType === "direct"
      ? [directInput, setDirectInput]
      : _cacheType === "associative"
        ? [associativeInput, setAssociativeInput]
        : [gAssociativeInput, setGAssociativeInput];

  const [currentInput, setCurrentInput] = getCurrentInput();

  // Función de validación
  const validateField = (fieldName: string, value: string): string => {
    const rules = VALIDATION_RULES[fieldName as keyof typeof VALIDATION_RULES];

    if (!rules) return "";

    if (value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }

    if (value && !rules.pattern.test(value)) {
      return rules.errorMessage;
    }

    return "";
  };

  // Función para actualizar campo con validación
  const updateFieldWithValidation = (
    field: string,
    value: string,
    updateFunction: (field: string, value: string) => void,
  ) => {
    const error = validateField(field, value);

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      updateFunction(field, value);
    }
  };

  const updateAddressFromComponents = (
    cacheType: CacheType,
    field: string,
    fieldValue: string,
  ) => {
    fieldValue = fieldValue.toUpperCase();

    // Validar antes de procesar
    const error = validateField(field, fieldValue);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
      return;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    switch (cacheType) {
      case "direct": {
        directInput[field] = fieldValue;
        directInput.bin =
          hexToBin(directInput.tag).padStart(8, "0") +
          hexToBin(directInput.line).padStart(14, "0") +
          hexToBin(directInput.word).padStart(2, "0");
        directInput.hex = binary4BitToHex(directInput.bin);

        const { tag, line, word } = parseHexAddress(directInput.hex);
        if (field !== "tag") directInput.tag = binToHex(tag);
        if (field !== "line") directInput.line = binToHex(line);
        if (field !== "word") directInput.word = binToHex(word);

        setDirectInput({ ...directInput });
        break;
      }
      case "associative": {
        associativeInput[field] = fieldValue;
        associativeInput.bin =
          hexToBin(associativeInput.bigtag).padStart(22, "0") +
          hexToBin(associativeInput.word).padStart(2, "0");
        associativeInput.hex = binary4BitToHex(associativeInput.bin);

        const { tag, word } = parseHexAssociativeAddress(associativeInput.hex);
        if (field !== "bigtag") associativeInput.bigtag = binToHex(tag);
        if (field !== "word") associativeInput.word = binToHex(word);

        setAssociativeInput({ ...associativeInput });
        break;
      }
      case "set-associative": {
        gAssociativeInput[field] = fieldValue;
        gAssociativeInput.bin =
          hexToBin(gAssociativeInput.tag).padStart(8, "0") +
          hexToBin(gAssociativeInput.set).padStart(14, "0") +
          hexToBin(gAssociativeInput.word).padStart(2, "0");
        gAssociativeInput.hex = binary4BitToHex(gAssociativeInput.bin);

        const { tag, line: set, word } = parseHexAddress(gAssociativeInput.hex);
        if (field !== "tag") gAssociativeInput.tag = binToHex(tag);
        if (field !== "set") gAssociativeInput.set = binToHex(set);
        if (field !== "word") gAssociativeInput.word = binToHex(word);

        setGAssociativeInput({ ...gAssociativeInput });
        break;
      }
    }
  };

  const updateComponentsFromAddress = (
    cacheType: CacheType,
    field: "bin" | "hex",
    fieldValue: string,
  ) => {
    const [currentInput, setCurrentInput] = getCurrentInput(cacheType);
    fieldValue = fieldValue.toUpperCase();

    // Validar antes de procesar
    const error = validateField(field, fieldValue);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
      return;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    currentInput[field] = fieldValue;
    let hexForParse: string;
    if (field === "bin") {
      const bin = fieldValue.padStart(24, "0");
      hexForParse = binary4BitToHex(bin);
      currentInput.hex = hexForParse;
    } else {
      hexForParse = fieldValue.padStart(6, "0");
      currentInput.bin = hexTo4BitBinary(hexForParse);
    }

    if (cacheType === "direct" || cacheType === "set-associative") {
      const { tag, line: lineOrSet, word } = parseHexAddress(hexForParse);
      currentInput.tag = binToHex(tag);
      currentInput.word = binToHex(word);
      if (cacheType === "direct") {
        directInput.line = binToHex(lineOrSet);
      } else {
        gAssociativeInput.set = binToHex(lineOrSet);
      }
    } else {
      const { tag, word } = parseHexAssociativeAddress(hexForParse);
      associativeInput.bigtag = binToHex(tag);
      associativeInput.word = binToHex(word);
    }

    setCurrentInput({ ...currentInput });
  };

  useEffect(() => {
    const defaultHex = randomHexChar(6);
    updateComponentsFromAddress("direct", "hex", defaultHex);
    updateComponentsFromAddress("associative", "hex", defaultHex);
    updateComponentsFromAddress("set-associative", "hex", defaultHex);
  }, []);

  const handleExecute = () => {
    // Verificar si hay errores antes de ejecutar
    if (Object.keys(errors).length > 0) {
      alert("Por favor corrige los errores antes de ejecutar");
      return;
    }

    onCacheTypeChange?.(cacheType);

    switch (cacheType) {
      case "direct":
        cpu.executeGetWordDirect(directInput.hex);
        break;
      case "associative":
        cpu.executeGetWordAssociative(associativeInput.hex);
        break;
      case "set-associative":
        cpu.executeGetWordSetAssociative(gAssociativeInput.hex);
        break;
    }

    cpu.next(); // Primer paso
  };

  // Función helper para renderizar campos con validación
  const renderValidatedTextField = (
    field: string,
    value: string,
    onChange: (value: string) => void,
  ) => (
    <div className="flex flex-col">
      <TextField
        value={value}
        onChange={(newValue) => {
          updateFieldWithValidation(field, newValue, (field, value) => {
            onChange(value);
          });
        }}
        className={errors[field] ? "border-red-500" : ""}
      />
      {errors[field] && (
        <span className="text-red-500 text-xs mt-1">{errors[field]}</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-row items-center justify-center p-6 bg-gray-300 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Caché:
        </label>
        <select
          value={cacheType}
          onChange={(e) => onCacheTypeChange(e.target.value as CacheType)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="direct">Caché Directa</option>
          <option value="associative" disabled>Caché Asociativa</option>
          <option value="set-associative" disabled>
            Caché Asociativa por Conjuntos
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col w-64 text-xs">
          <div className="flex flex-row items-center">
            <p className="w-32">En hexadecimal:</p>
            {renderValidatedTextField("hex", currentInput.hex, (hex) => {
              updateComponentsFromAddress(cacheType, "hex", hex);
            })}
          </div>
          <div className="flex flex-row items-center">
            <p className="w-32">En binario:</p>
            {renderValidatedTextField("bin", currentInput.bin, (bin) => {
              updateComponentsFromAddress(cacheType, "bin", bin);
            })}
          </div>
          <div className="flex flex-col gap-1">
            {cacheType === "direct" ? (
              <>
                <div className="flex flex-row items-center">
                  <p className="w-16">Tag:</p>
                  {renderValidatedTextField("tag", directInput.tag, (tag) => {
                    updateAddressFromComponents(cacheType, "tag", tag);
                  })}
                  <p className="w-16 ml-2">Line:</p>
                  {renderValidatedTextField(
                    "line",
                    directInput.line,
                    (line) => {
                      updateAddressFromComponents(cacheType, "line", line);
                    },
                  )}
                  <p className="w-16 ml-2">Word:</p>
                  {renderValidatedTextField(
                    "word",
                    directInput.word,
                    (word) => {
                      updateAddressFromComponents(cacheType, "word", word);
                    },
                  )}
                </div>
              </>
            ) : cacheType === "associative" ? (
              <div className="flex flex-row items-center">
                <p className="w-16">Tag:</p>
                {renderValidatedTextField("bigtag", associativeInput.bigtag, (tag) =>
                  updateAddressFromComponents(cacheType, "bigtag", tag),
                )}
                <p className="w-16 ml-2">Word:</p>
                {renderValidatedTextField(
                  "word",
                  associativeInput.word,
                  (word) =>
                    updateAddressFromComponents(cacheType, "word", word),
                )}
              </div>
            ) : (
              // set-associative
              <div className="flex flex-row items-center">
                <p className="w-16">Tag:</p>
                {renderValidatedTextField("tag", gAssociativeInput.tag, (tag) =>
                  updateAddressFromComponents(cacheType, "tag", tag),
                )}
                <p className="w-16 ml-2">Set:</p>
                {renderValidatedTextField("set", gAssociativeInput.set, (set) =>
                  updateAddressFromComponents(cacheType, "set", set),
                )}
                <p className="w-16 ml-2">Word:</p>
                {renderValidatedTextField(
                  "word",
                  gAssociativeInput.word,
                  (word) =>
                    updateAddressFromComponents(cacheType, "word", word),
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            disabled={isDisabled || Object.keys(errors).length > 0}
            onClick={handleExecute}
          >
            Ejecutar Caché
          </Button>
          {Object.keys(errors).length > 0 && (
            <p className="text-red-500 text-xs text-center">
              Corrige los errores antes de ejecutar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
