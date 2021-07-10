import React, { useRef, useEffect, useState } from "react";

import { fromEvent, of } from "rxjs";
import {
  map,
  catchError,
  debounceTime,
  switchMap,
  distinctUntilChanged,
} from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import "./App.css";

const apiKey = process.env.REACT_APP_PLACES_APIKEY;

function App() {
  const textLookUpRef = useRef();

  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!textLookUpRef.current) {
      return;
    }

    const keys$ = fromEvent(textLookUpRef.current, "keyup").pipe(
      debounceTime(300) //slow down a bit
    );

    // stream text changes
    const textChanges$ = keys$.pipe(
      map((e) => e.target.value), //get text value
      distinctUntilChanged() //only emit changed values
    );

    // merge to lookup api
    const lookup$ = textChanges$.pipe(
      switchMap((v) =>
        ajax(
          `/api/place/autocomplete/json?input=${v}&key=${apiKey}&sessiontoken=1234567890`
        ).pipe(
          map((r) => r.response.predictions),
          catchError((error) => {
            console.log("error: ", error);
            return of(error);
          })
        )
      )
    );

    lookup$.subscribe((results) => {
      console.log(results);
      setResults(results);
    });
  }, [textLookUpRef]);

  return (
    <div className="App">
      <header className="App-header">
        <p>RxJS - Google Places API demo</p>
        <input
          type="text"
          ref={textLookUpRef}
          id="textLookup"
          placeholder="enter location name"
          style={{ height: "1.4em", width: "20em", fontSize: "1em" }}
        />
        {results && (
          <ul>
            {results.map((r, i) => (
              <li key={i}>{r.description}</li>
            ))}
          </ul>
        )}

        {(!results || !results.length || results.length === 0) && (
          <p>No results matched</p>
        )}
      </header>
    </div>
  );
}

export default App;
