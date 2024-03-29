import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor, { MonacoEditorProps, monaco } from 'react-monaco-editor';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import nord from 'react-syntax-highlighter/dist/esm/styles/prism/nord';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import darcula from 'react-syntax-highlighter/dist/esm/styles/prism/darcula';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import axios from 'axios';
import { getCLS, getFID, getLCP } from 'web-vitals';
import './CodeEditorStyles.css';

interface Plugin {
  name: string;
  description: string;
  author: string;
  version: string;
  enabled: boolean;
}

const supportedLanguages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Swift', value: 'swift' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'PHP', value: 'php' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Scala', value: 'scala' },
  { label: 'R', value: 'r' },
  { label: 'Perl', value: 'perl' },
  { label: 'Haskell', value: 'haskell' },
  { label: 'Lua', value: 'lua' },
  { label: 'SQL', value: 'sql' },
  { label: 'Assembly', value: 'assembly' },
  { label: 'Shell', value: 'shell' },
];


const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    // Load code from local storage on component mount
    const storedCode = localStorage.getItem('userCode');
    return storedCode ? storedCode : '// Write your code here';
  });


  useEffect(() => {
    const savedBindings = localStorage.getItem('customKeyBindings');
    if (savedBindings) {
      setCustomKeyBindings(JSON.parse(savedBindings));
    }
  }, []);

  const [showSpaceEffect, setShowSpaceEffect] = useState(true);
  const [actionNames, setActionNames] = useState<{ [key: string]: string }>({});
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [stopAnimation, setStopAnimation] = useState<boolean>(false);
  const [, setSuggestions] = useState<string[]>([]);
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showThemeAndStyleOptions, setShowThemeAndStyleOptions] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [output, setOutput] = useState('');
  const [speaking, setSpeaking] = useState(false); // Track if speaking is in progress
  const [error, setError] = useState('');
  const [showPluginManagement, setShowPluginManagement] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [showKeyBindings, setShowKeyBindings] = useState(false);
  const [newPluginName, setNewPluginName] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [showDependencyOptions, setShowDependencyOptions] = useState(false);
  const [, setIsLoading] = useState(false);
  const [, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dependencyStatus, setDependencyStatus] = useState('');
  const terminal = useRef<Terminal | null>(null);
  const [errorLines, setErrorLines] = useState<number[]>([]);
  const [currentStyle, setCurrentStyle] = useState<React.CSSProperties>(nord);
  const [language, setLanguage] = useState<string>('javascript');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [customKeyBindings, setCustomKeyBindings] = useState<{ [key: string]: () => void }>({});
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [files, setFiles] = useState<string[]>(() => {
    const storedFiles = localStorage.getItem('userFiles');
    return storedFiles ? JSON.parse(storedFiles) : [];
  });
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Add or remove 'high-contrast' class based on the isHighContrastMode state
    const body = document.body;
    if (isHighContrastMode) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }, [isHighContrastMode]);

  const toggleHighContrastMode = () => {
    setIsHighContrastMode(prevMode => !prevMode);

    const body = document.body;
    body.classList.toggle('high-contrast-mode');

    // Speak the content of the entire page if high contrast mode is enabled
    if (!isHighContrastMode) {
      speakPageContent();
    } else {
      // If high contrast mode is disabled, stop speaking
      stopSpeaking();
    }
    setFontSize(16);
  };

  // Function to speak the content of the entire page
  const speakPageContent = () => {
    // Get all text content on the page
    const pageContent = document.body.innerText;

    // Check if the SpeechSynthesis API is available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(pageContent);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true); // Set speaking state to true
    } else {
      // SpeechSynthesis API not supported
      console.error('SpeechSynthesis API is not supported in this browser.');
    }
  };

  // Function to stop speaking
  const stopSpeaking = () => {
    // Check if speaking is in progress
    if (speaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop speaking
      setSpeaking(false); // Set speaking state to false
    }
  };
  
  const increaseFontSize = () => {
    setFontSize(prevSize => prevSize + 1);
  };
  
  const decreaseFontSize = () => {
    setFontSize(prevSize => Math.max(prevSize - 1, 8)); // Ensure minimum font size is 8px
  };
  
  
  useEffect(() => {
    const reportWebVitals = (metric) => {
      switch(metric.name) {
        case 'CLS':
          console.log('Cumulative Layout Shift (CLS):', metric.value);
          break;
        case 'FID':
          console.log('First Input Delay (FID):', metric.value);
          break;
        case 'LCP':
          console.log('Largest Contentful paint (LCP):', metric.value);
          break;
          default:
          break;
      }
    };

const unsubscribeFuntions = [
  getCLS(reportWebVitals),
  getFID(reportWebVitals),
  getLCP(reportWebVitals)
];

  return () => {
      unsubscribeFuntions.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
  }
});
};
}, []);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await axios.get('http://localhost:3005/plugins');
      setPlugins(response.data.plugins);
    } catch (error) {
      console.error('Error fetching plugins:', error);
    }
  };

  const installPlugin = async () => {
    try {
      // Display "Downloading" message
      setTerminalOutput(prevOutput => prevOutput + `Downloading ${newPluginName}...\n`);
  
      // Make a POST request to the backend to handle the installation
      const installProcess = await axios.post('http://localhost:3005/install-plugin', { name: newPluginName });
      // Extract the output from the response
      const output = installProcess?.data?.output || '';
  
      // Append the output of the installation process to the terminal output
      setTerminalOutput(prevOutput => prevOutput + output + '\n');
  
      // If there are vulnerabilities reported, notify the user
      if (output.includes && output.includes('vulnerabilities')) {
        setErrorMessage('There are vulnerabilities in the installed packages. Run "npm audit" for details.');
      } else {
        // Display success message
        setSuccessMessage(`Plugin "${newPluginName}" installed successfully.`);
        setErrorMessage(''); // Reset error message
  
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
          setTerminalOutput('');
        }, 3000);
      }
  
      // Fetch plugins after installation
      await fetchPlugins();
    } catch (error) {
      console.error('Error installing plugin:', error);
      // Display error message in the terminal
      setTerminalOutput(prevOutput => prevOutput + `Error: ${error.message}\n`);
      setErrorMessage(`Error installing plugin "${newPluginName}": ${error.message}`);
      setSuccessMessage(''); // Reset success message
    }
  };
  
  
  const togglePlugin = async (pluginName: string) => {
    try {
      const response = await axios.put(`http://localhost:3005/plugins/${pluginName}/toggle`);
      console.log('Plugin status toggled successfully:', response.data);
      fetchPlugins();
    } catch (error) {
      console.error('Error toggling plugin status:', error);
    }
  };

  const removePlugin = async (pluginName: string) => {
    try {
      const response = await axios.delete(`http://localhost:3005/plugins/${pluginName}`);
      console.log('Plugin removed successfully:', response.data);
      fetchPlugins();
    } catch (error) {
      console.error('Error removing plugin:', error);
    }
  };


  const fetchFiles = () => {
    console.log('Fetching files...');
    axios.get('http://localhost:3005/files')
        .then(response => {
            console.log('Files fetched successfully:', response.data.files);
            setFiles(response.data.files);

            // Save the fetched files to local storage
            localStorage.setItem('userFiles', JSON.stringify(response.data.files));
        })
        .catch(error => {
            console.error('Error fetching files:', error);
            alert('Error fetching files. Please try again.');
        });
  };

const createFile = () => {
  const fileName = prompt('Enter file name:');
  if (fileName) {
    const language = prompt('Enter the language (e.g., javascript, python):');
    if (language) {
      console.log('Creating file:', fileName, 'in', language);
      axios.post('http://localhost:3005/create', { fileName, language })
        .then(response => {
          console.log('File created successfully:', response.data.message);
          fetchFiles(); // Update the file list after creating a file

          // Save the updated list of files to local storage
          const updatedFiles = response.data.files;
          localStorage.setItem('userFiles', JSON.stringify(updatedFiles));
        })
        .catch(error => {
          console.error('Error creating file:', error);
          if (error.response) {
            alert('Error creating file: ' + error.response.data.error);
          } else {
            alert('Error creating file. Please try again.');
          }
        });
    } else {
      alert('Language cannot be empty. Please try again.');
    }
  }
};


const renameFile = (oldName: string) => {
  const newName = prompt('Enter new file name:', oldName);
  if (newName && newName !== oldName) {
      console.log('Renaming file:', oldName, 'to', newName);
      axios.post('http://localhost:3005/rename', { oldName, newName }) // Updated URL
          .then(response => {
              console.log('File renamed successfully:', response.data.message);
              fetchFiles(); // Update the file list after renaming a file
          })
          .catch(error => {
              console.error('Error renaming file:', error);
              alert('Error renaming file. Please try again.');
          });
  }
};

const deleteFile = (fileName: string) => {
  if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      console.log('Deleting file:', fileName);
      axios.delete(`http://localhost:3005/files/${fileName}`) // Updated URL
          .then(response => {
              console.log('File deleted successfully:', response.data.message);
              fetchFiles(); // Update the file list after deleting a file
          })
          .catch(error => {
              console.error('Error deleting file:', error);
              alert('Error deleting file. Please try again.');
          });
  }
};



  const runCode = async () => {
    try {
      const response = await axios.post('http://localhost:3005/runcode', {
        code,
        language,
      });

      setTerminalOutput('');

      // Clear previous output
      terminal.current?.clear();

      // Write output to terminal
      if (response.data.output) {
        terminal.current?.write(response.data.output + '\r\n');
        setOutput(response.data.output); // Update output state
      }

      // Write error to terminal if there is any
      if (response.data.error) {
        terminal.current?.write(response.data.error + '\r\n');
        setError(response.data.error); // Update error state
      }
    } catch (error) {
      // Handle error
      console.error('Error running code:', error);
      terminal.current?.write('Error running code: ' + error.message + '\r\n');
      setError('Error running code: ' + error.message); // Update error state
    }
  };
  
  useEffect(() => {
    if (showTerminal && terminalRef.current) {
      // Initialize terminal only when it's visible
      const term = new Terminal();
      term.open(terminalRef.current);
  
      // Resize the terminal when the window is resized
      const resizeHandler = () => {
        if (term && terminalRef.current) {
          term.resize(terminalRef.current.offsetWidth, terminalRef.current.offsetHeight);
        }
      };
      window.addEventListener('resize', resizeHandler);
      resizeHandler();
  
      // Handle keyboard input
      const handleKeyInput = (ev: KeyboardEvent) => {
        if (term && ev.key) {
          if (!ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.shiftKey) { // Allow normal typing
            term.write(ev.key);
          } else if (ev.key === "Backspace") { // Handle backspace
            term.write('\b');
          } else if (ev.key === "Enter") { // Handle Enter key
            term.write('\r\n');
          }
        }
      };
      window.addEventListener('keydown', handleKeyInput);
  
      // Handle Ctrl + V for paste
      const handleCtrlV = (ev: KeyboardEvent) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "v") {
          navigator.clipboard.readText().then(text => {
            term.write(text);
          }).catch(err => {
            console.error('Error pasting:', err);
          });
          ev.preventDefault();
        }
      };
      window.addEventListener('keydown', handleCtrlV);
  
      const updateTerminalContent = () => {
        if (term && output) {
          term.write(output);
        }
      };
  
      updateTerminalContent(); // Call initially to display existing output
  
      // Cleanup
      return () => {
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('keydown', handleKeyInput);
        window.removeEventListener('keydown', handleCtrlV);
        term.dispose();
      };
    }
  }, [showTerminal, output]); // Include output as a dependency
  
  
  const toggleStyle = () => {
    if (currentStyle === nord) {
      setCurrentStyle(atomDark);
    } else if (currentStyle === atomDark) {
      setCurrentStyle(darcula);
    } else {
      setCurrentStyle(nord);
    }
  };

  const handleRunCodeButtonClick = () => {
    setShowTerminal(true); // Show terminal immediately
    runCode(); // Execute code
  };
  

  const handleBackToEditorButtonClick = () => {
    setShowTerminal(false); // Switch back to code editor view
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyCombination = `${event.altKey ? 'Alt+' : ''}${event.key.toUpperCase()}`;
      const action = customKeyBindings[keyCombination];
      
      if (action) {
        event.preventDefault(); // Prevent the default browser behavior
        action();   
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [customKeyBindings]);

  
  const editorOptions: MonacoEditorProps['options'] = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    theme: theme === 'light' ? 'vs-light' : 'vs-dark',
    minimap: { enabled: false },
    fontSize: 14,
  };
  

  // Save key bindings to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('customKeyBindings', JSON.stringify(customKeyBindings));
  }, [customKeyBindings]);

  useEffect(() => {
    // Save code to local storage whenever it changes
    localStorage.setItem('userCode', code);
  }, [code]);

  useEffect(() => {
    // Apply custom key bindings when editor ref is available
    const editor = editorRef.current;
    if (editor) {
      Object.entries(customKeyBindings).forEach(([keyCombination, action]) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode[keyCombination], action);
      });
    }
  }, [customKeyBindings]);

  const handleEditorChange: MonacoEditorProps['onChange'] = async (newValue) => {
    setCode(newValue);
  
    // Check if the new value is empty (code deleted)
    if (!newValue.trim()) {
      deleteCodeFromDatabase();
    } else {
      saveCodeToDatabase(newValue);
  
      const randomLine = Math.floor(Math.random() * 10) + 1;
      setErrorLines([randomLine]);
  
      const computedSuggestions = computeSuggestions(newValue);
      setSuggestions(await computedSuggestions);
    }

    runCode();
  };

  const initializeLanguageService = () => {
    if (monaco.languages.typescript) {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
      });
    } else {
      setTimeout(initializeLanguageService, 100);
    }
  };
 
  
  // Call this function when the component mounts or when the language changes
  useEffect(() => {
    initializeLanguageService();
  }, [language]);

  const computeSuggestions = async (code: string): Promise<string[]> => {
  const model = monaco.editor.createModel(code, language);
  
  // Ensure monaco.languages.typescript is defined before accessing methods
  if (!monaco.languages.typescript) {
    // Retry after a short delay if monaco.languages.typescript is not yet defined
    setTimeout(() => computeSuggestions(code), 100);
    return [];
  }

  // Ensure editorRef.current is not null
  if (!editorRef.current || !model) {
    return [];
  }

  const position = editorRef.current.getPosition();
  
  if (!position) {
    return [];
  }

  const languageService = await monaco.languages.typescript.getTypeScriptWorker();
  const service = languageService(model.uri);
  const suggestions = await (await service).getCompletionsAtPosition(
    model.uri.toString(),
    position.column
  );
  
  if (!suggestions || !suggestions.entries) {
    return [];
  }

  return suggestions.entries.map(entry => entry.name);
};

  
  

  useEffect(() => {
    if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
            const markers: monaco.editor.IMarkerData[] = errorLines
                .filter(lineNumber => lineNumber > 0 && lineNumber <= model.getLineCount()) // Filter out invalid line numbers
                .map(lineNumber => ({
                    severity: monaco.MarkerSeverity.Error,
                    message: 'Example Error Message',
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: 1,
                    endColumn: model.getLineMaxColumn(lineNumber),
                }));

            monaco.editor.setModelMarkers(model, 'error', markers);
        }
    }
}, [errorLines]);

  const saveCodeToDatabase = (newCode: string) => {
    fetch('http://localhost:8082/saveCodeToDatabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: newCode }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => console.log('Response from server:', data))
      .catch(error => console.error('Error saving code to database:', error));
  };

  const deleteCodeFromDatabase = () => {
    // Check if the current code is not empty before attempting to delete
    if (!code.trim()) {
      console.error('Code not provided for deletion');
      return;
    }

    fetch('http://localhost:8082/deleteCodeFromDatabase', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => console.log('Response from server:', data))
      .catch(error => console.error('Error deleting code from database:', error));
  };

  const customizeKeyBindings = () => {
    const actionOptions = {
        toggleTheme: toggleTheme,
        copyCode: copyCodeToClipboard,
        clearEditor: clearEditorContent,
        toggleLineNumbers: toggleLineNumbersVisibility,
    };

    const actionKeys = Object.keys(actionOptions);

    const selectedActionIndex = parseInt(prompt(
        `Select the action you want to bind a key to:\n${actionKeys.map((key, index) => `${index + 1}. ${key}`).join('\n')}`
    ) || '');

    if (!isNaN(selectedActionIndex) && selectedActionIndex >= 1 && selectedActionIndex <= actionKeys.length) {
        const selectedAction = actionKeys[selectedActionIndex - 1];
        const action = actionOptions[selectedAction];
        const actionNameInput = prompt(`Enter a name for the action (e.g., "Toggle Theme"):`);

        if (actionNameInput !== null) {
            const actionName = actionNameInput.trim();

            if (actionName !== '') {
                const newKeyCombination = prompt(`Enter a new key combination for "${actionName}" (e.g., Alt+A):`);

                if (newKeyCombination !== null && newKeyCombination !== '') {
                    const [modifiers, key] = newKeyCombination.split('+').map(str => str.trim());

                    if (modifiers && key) {

                        // Create a copy of the current custom key bindings
                        const updatedBindings = { ...customKeyBindings };

                        // Add the new key combination and action
                        updatedBindings[newKeyCombination] = action;
                        actionNames[newKeyCombination] = actionName; // Add action name

                        // Update the state with the new bindings and action names
                        setCustomKeyBindings(updatedBindings);
                        setActionNames(actionNames);

                        // Save updated key bindings and action names to local storage
                        localStorage.setItem('customKeyBindings', JSON.stringify(updatedBindings));
                        localStorage.setItem('actionNames', JSON.stringify(actionNames));

                        alert(`Key binding ${modifiers}+${key.toUpperCase()} for "${actionName}" added successfully.`);
                    } else {
                        alert('Invalid key Combination! Please enter a valid key combination in the format Modifiers+Key (e.g., Alt+A).');
                    }
                } else {
                    alert('Key combination was not provided. Key binding was not added.');
                }
            } else {
                alert('Action name cannot be empty. Key binding was not added.');
            }
        } else {
            alert('Action name was not provided. Key binding was not added.');
        }
    } else {
        alert('Invalid action selected. Key binding was not added.');
    }
};

  
  const toggleLineNumbersVisibility = () => {
    const lineNumbersElement = document.querySelector('.line-numbers') as HTMLElement | null;
  
    if (lineNumbersElement) {
      const currentVisibility = window.getComputedStyle(lineNumbersElement).getPropertyValue('display');
      lineNumbersElement.style.display = currentVisibility === 'none' ? 'block' : 'none';
    }
  };

  
  const clearEditorContent = () => {
    setCode('');
  };
  

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };
  
  const editKeyBinding = (keyCombination: string) => {
    const currentAction = actionNames[keyCombination] || "";
    const newAction = prompt(`Enter the new action name for "${currentAction}" (leave empty to keep "${currentAction}"):`, currentAction);
  
    if (newAction !== null) {
        const newKeyCombination = prompt(`Enter a new key combination for "${newAction}" (e.g., Alt+A):`, keyCombination);
      
        if (newKeyCombination !== null) {
            const [modifiers, key] = newKeyCombination.split('+').map(str => str.trim());
      
            if (modifiers && key) {
                const keyCode = key.toUpperCase().charCodeAt(0);
      
                // Create a copy of the current custom key bindings
                const updatedBindings = { ...customKeyBindings };
      
                // Remove the old key combination and add the new one
                delete updatedBindings[keyCombination];
                updatedBindings[newKeyCombination] = customKeyBindings[keyCombination];
      
                // Update the state with the new bindings
                setCustomKeyBindings(updatedBindings);
      
                // Save updated key bindings to local storage
                localStorage.setItem('customKeyBindings', JSON.stringify(updatedBindings));

                // Update action names
                const updatedActionNames = { ...actionNames };
                delete updatedActionNames[keyCombination];
                updatedActionNames[newKeyCombination] = newAction;
                setActionNames(updatedActionNames);
      
                alert(`Key binding ${modifiers}+${key.toUpperCase()} for "${newAction}" edited successfully.`);
            } else {
                alert('Invalid key Combination! Please enter a valid key combination in the format Modifiers+Key (e.g., Alt+A).');
            }
        } else {
            alert('Edit canceled or no key combination provided. Key binding was not edited.');
        }
    } else {
        alert('No action name provided. Key binding was not edited.');
    }
};

  
  const deleteKeyBinding = (keyCombination: string) => {
    const confirmation = window.confirm(`Are you sure you want to delete the key combination for ${keyCombination}?`);
  
    if (confirmation) {
      // Create a copy of the current custom key bindings
      const updatedBindings = { ...customKeyBindings };
  
      // Remove the key combination
      delete updatedBindings[keyCombination];
  
      // Update the state with the new bindings
      setCustomKeyBindings(updatedBindings);
  
      // Save updated key bindings to local storage
      localStorage.setItem('customKeyBindings', JSON.stringify(updatedBindings));
  
      alert(`Key binding for ${keyCombination} deleted successfully `);
    }
  };
  
  const handleCheckDependencies = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setDependencyStatus('');

    try {
      const response = await axios.get('http://localhost:3005/check-dependencies');
      console.log(response.data.output); // Output contains the result of dependency check
      if (response.data.message === 'All dependencies are installed') {
        setSuccessMessage('All dependencies are installed');
        setDependencyStatus('Dependencies are installed.');
        // Hide the success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        // Handle case where some dependencies are missing
        setDependencyStatus('Some dependencies are missing.');
      }
      setTimeout(() => {
        setDependencyStatus('');
      }, 10000);

    } catch (error) {
      console.error('Error checking dependencies:', error);
      setErrorMessage('Error checking dependencies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallDependencies = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setDependencyStatus('Installing dependencies...');

    try {
      const response = await axios.post('http://localhost:3005/install-dependencies');
      console.log(response.data.message);
      setSuccessMessage('Dependencies installed successfully');
      setDependencyStatus('Dependencies installed.');

      // Hide the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      setTimeout(() => {
        setDependencyStatus('');
      }, 10000);

    } catch (error) {
      console.error('Error installing dependencies:', error);
      setErrorMessage('Error installing dependencies. Please try again later.');
      setDependencyStatus('Installation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDependencyOptions = () => {
    setShowDependencyOptions(!showDependencyOptions);
  };

  const toggleThemeAndStyle = () => {
    setShowThemeAndStyleOptions(!showThemeAndStyleOptions);
  };
  
  const toggleKeyBindings = () => {
    setShowKeyBindings(!showKeyBindings);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setStopAnimation(true);
    }, 20000);
    return () => clearTimeout(timer);
  },[]);

  const togglePluginManagement = () => {
    setShowPluginManagement(!showPluginManagement);
    setNewPluginName(''); // Reset the input field when toggling visibility
  };

  const toggleCodeVisibility = () => {
    setShowCode(!showCode);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpaceEffect(false);
    }, 5000); // Adjust the delay time as needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`background-container ${showSpaceEffect ? 'space-effect' : ''}`}>
      <div className={`asteroid ${stopAnimation ? 'stop-animation' : ''}`} />
      <div className={`asteroid ${stopAnimation ? 'stop-animation' : ''}`} />
      <div className={`asteroid ${stopAnimation ? 'stop-animation' : ''}`} />
      <div className={`asteroid ${stopAnimation ? 'stop-animation' : ''}`} />
      <div className={`asteroid ${stopAnimation ? 'stop-animation' : ''}`} />
      <div className="code-editor-container">
        <h2 className="code-editor-header">Code Editor Component</h2>
        {/* Button container */}
        <div className="button-container">
         <div className="content" style={{ fontSize: `${fontSize}px` }}>
          <button className="high-contrast-button-four" onClick={toggleHighContrastMode}>
            Accessibility Options
          </button>
          {isHighContrastMode && (
            <div className="content">
            <div className="font-size-buttons">
              <button onClick={increaseFontSize}>Increase Font Size</button>
              <button onClick={decreaseFontSize}>Decrease Font Size</button>
            </div>
            </div>
          )}
            <button className="dependency-options-button" onClick={toggleDependencyOptions}>Dependency Options</button>
            {showDependencyOptions && (
              <div className="dependency-options">
                <button onClick={handleInstallDependencies}>Install Dependencies</button>
                <button onClick={handleCheckDependencies}>Check Dependencies</button>
              </div>
            )}
            {dependencyStatus && <p>{dependencyStatus}</p>}
            {successMessage && <p>{successMessage}</p>}
            <button className="toggle-theme-style-button" onClick={toggleThemeAndStyle}>Toggle Theme/Style</button>
            {showThemeAndStyleOptions && (
              <div className="theme-and-style-options">
                <button onClick={toggleTheme}>Toggle Theme</button>
                <button onClick={toggleStyle}>Toggle Style</button>
              </div>
            )}
            <button className="toggle-key-bindings-button" onClick={toggleKeyBindings}>Key Bindings</button>
            {showKeyBindings && (
              <div className="key-bindings">
                <button onClick={customizeKeyBindings}>Customize Key Bindings</button>
                <h3>Key Bindings:</h3>
                <ul>
                  {Object.entries(customKeyBindings).map(([keyCombination, action]) => (
                    <li key={keyCombination}>
                      {actionNames[keyCombination]} - {keyCombination}
                      <button onClick={() => editKeyBinding(keyCombination)}>Edit</button>
                      <button onClick={() => deleteKeyBinding(keyCombination)}>Delete</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>    
          <div className="terminal-output">
            {showTerminal && (
              <pre>{terminalOutput}</pre>
            )}
          </div>
          <ul className="plugin-list">
            {plugins.map((plugin, index) => (
              <li key={index}>
                {plugin.name}
                {plugin.enabled ? (
                  <button onClick={() => togglePlugin(plugin.name)}>Disable</button>
                ) : (
                  <button onClick={() => togglePlugin(plugin.name)}>Enable</button>
                )}
                <button onClick={() => removePlugin(plugin.name)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
        {showCode ? (
        <div className="file-navigation-panel">
          <h3>File Navigation Panel</h3>
          <ul className="file-list">
            {files.map(fileName => (
              <li key={fileName}>
                <span>{fileName}</span>
                <button onClick={() => {
                  const newFileName = prompt('Enter new file name:', fileName);
                  if (newFileName !== null) {
                    renameFile(fileName);
                  }
                }}>Rename</button>
                <button onClick={() => deleteFile(fileName)}>Delete</button>
              </li>
            ))}
          </ul>
          <button onClick={createFile}>New File</button>
          <button onClick={toggleCodeVisibility}>Hide Code</button>
        </div>
      ) : (
        <div className="Show-file-vis">
        <button className="custom-button" onClick={toggleCodeVisibility}>Show File Navigation Panel Code</button>
      </div>

      )}
    </div>
            <select className="language-select-one" value={language} onChange={handleLanguageChange}>
          {supportedLanguages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="term-container">
        <div className="terminal-container">
          {showTerminal ? (
            <div ref={terminalRef} style={{ width: '85vh', height: '37px' }}>
              <button onClick={handleBackToEditorButtonClick}>Back to Editor</button>
              {error && <div>Error: {error}</div>}
            </div>
          ) : (
            <>
              <div className="editor-container-three">
                <SyntaxHighlighter language={language} style={currentStyle}>
                  {code}
                </SyntaxHighlighter>
              </div>
              <MonacoEditor
                width="800"
                height="600"
                language={language}
                theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
                value={code}
                options={{ automaticLayout: true }}
                onChange={handleEditorChange}
                editorDidMount={(editor) => {
                  editorRef.current = editor;
                }}
              />             
              <button className="editor-buttons" onClick={handleRunCodeButtonClick}>Run Code</button>
            </>
          )}
        <div className="plugin-management">
          <label className="switch">
            <input type="checkbox" onChange={togglePluginManagement} checked={showPluginManagement} />
            <span className="slider round"></span>
          </label>
          <span className={`toggle-text ${showPluginManagement ? 'zoom-off' : 'zoom-in'}`}>
            {showPluginManagement ? <span role="img" aria-label="Spaceship">🚀</span> : 'Show Plugin Management'}
          </span>
          {showPluginManagement && (
            <div className="plugin-page">
              <h2>Plugin Management</h2>
              <div>
                <input
                  className="plugin-input"
                  type="text"
                  value={newPluginName}
                  onChange={(e) => setNewPluginName(e.target.value)}
                  placeholder="Enter plugin name"
                />
                <button onClick={installPlugin}>Install Plugin</button>
              </div>
            </div>
          )}
        </div>
        </div>
        </div>
      </div>
  );
};
export default CodeEditor;