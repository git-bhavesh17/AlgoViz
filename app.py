from flask import Flask, render_template, request, jsonify
import heapq
from collections import deque

app = Flask(__name__)

# ---------- Algorithms ----------

def heuristic(a, b):
    return abs(a - b)

def astar(graph, start, goal):
    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    steps = []

    while open_set:
        _, current = heapq.heappop(open_set)
        steps.append({"current": current, "g": g_score[current], "h": heuristic(current, goal), "f": f_score[current]})

        if current == goal:
            path = reconstruct_path(came_from, current)
            return path, steps

        for neighbor, cost in graph.get(str(current), []):
            tentative_g = g_score[current] + cost
            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return [], steps

def bfs(graph, start, goal):
    queue = deque([start])
    came_from = {}
    visited = set([start])
    steps = []

    while queue:
        current = queue.popleft()
        steps.append({"current": current, "queue": list(queue)})

        if current == goal:
            path = reconstruct_path(came_from, current)
            return path, steps

        for neighbor, _ in graph.get(str(current), []):
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                queue.append(neighbor)

    return [], steps

def dfs(graph, start, goal):
    stack = [start]
    came_from = {}
    visited = set([start])
    steps = []

    while stack:
        current = stack.pop()
        steps.append({"current": current, "stack": list(stack)})

        if current == goal:
            path = reconstruct_path(came_from, current)
            return path, steps

        for neighbor, _ in graph.get(str(current), []):
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                stack.append(neighbor)

    return [], steps

def reconstruct_path(came_from, current):
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    return path[::-1]

# ---------- Flask Routes ----------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/run_algorithm", methods=["POST"])
def run_algorithm():
    data = request.json
    graph = data["graph"]
    start = int(data["start"])
    goal = int(data["goal"])
    algo = data["algorithm"]

    if algo == "astar":
        path, steps = astar(graph, start, goal)
    elif algo == "bfs":
        path, steps = bfs(graph, start, goal)
    elif algo == "dfs":
        path, steps = dfs(graph, start, goal)
    else:
        return jsonify({"error": "Unknown algorithm"})

    return jsonify({"path": path, "steps": steps})
    
if __name__ == "__main__":
    app.run(debug=True)
