import {
    h,
    render,
    useState,
    useCallback,
} from "https://cdn.jsdelivr.net/npm/fre@2.0.0-rc9/dist/fre.js";

function App() {
    const [count, setCount] = useState(0);
    const onClick = useCallback(() => setCount(count + 1), [count]);
    return <button onClick={onClick}>You've clicked {count} times!</button>;
}

render(<App />, document.getElementById("root"));
