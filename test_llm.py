from langchain_ollama import OllamaLLM

print("Testing with num_predict=400...")
llm_fast = OllamaLLM(model="gemma4:latest", temperature=0, num_predict=400)
try:
    res1 = llm_fast.invoke("Hello, who are you?")
    print("Result:", repr(res1))
except Exception as e:
    print("Error:", e)

print("\nTesting WITHOUT num_predict...")
llm_normal = OllamaLLM(model="gemma4:latest", temperature=0)
try:
    res2 = llm_normal.invoke("Hello, who are you?")
    print("Result:", repr(res2))
except Exception as e:
    print("Error:", e)
