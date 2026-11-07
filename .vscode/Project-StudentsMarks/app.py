from dotenv import load_dotenv
from openai import OpenAI
from flask import jsonify
load_dotenv()

client = OpenAI()
from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

DATABASE = "school.db"


# Create database and table
def init_db():
    conn = sqlite3.connect(DATABASE)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mark INTEGER NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# Get marks from database

def get_marks():
    conn = sqlite3.connect(DATABASE)

    rows = conn.execute(
        "SELECT id, mark FROM marks ORDER BY id"
    ).fetchall()

    conn.close()

    return rows


# Dashboard
@app.route("/", methods=["GET", "POST"])
def home():

    if request.method == "POST":

        mark = request.form.get("mark", type=int)

        if mark is not None and 0 <= mark <= 100:

            conn = sqlite3.connect(DATABASE)

            conn.execute(
                "INSERT INTO marks (mark) VALUES (?)",
                (mark,)
            )

            conn.commit()
            conn.close()

        return redirect(url_for("home"))

    rows = get_marks()

    marks = [row[1] for row in rows]

    total_students = len(marks)

    average = sum(marks) / total_students if total_students else 0

    highest = max(marks) if marks else 0

    lowest = min(marks) if marks else 0

    passed = sum(1 for mark in marks if mark >= 40)

    failed = total_students - passed

    return render_template(
        "index.html",
        marks=marks,
        average=average,
        highest=highest,
        lowest=lowest,
        passed=passed,
        failed=failed
    )


# Delete mark
@app.route("/delete/<int:index>")
def delete_mark(index):

    rows = get_marks()

    if 0 <= index < len(rows):

        student_id = rows[index][0]

        conn = sqlite3.connect(DATABASE)

        conn.execute(
            "DELETE FROM marks WHERE id = ?",
            (student_id,)
        )

        conn.commit()
        conn.close()

    return redirect(url_for("home"))
@app.route("/ai-insights", methods=["POST"])
def ai_insights():
    marks = get_marks()

    if not marks:
        return jsonify({
            "success": False,
            "message": "No student marks available to analyze."
        }), 400

    marks_list = [row[0] for row in marks]

    prompt = f"""
    You are an expert school academic analyst.

    Analyze these student marks:
    {marks_list}

    Provide:
    1. Overall academic performance
    2. Strong performance observations
    3. Areas needing improvement
    4. Three practical recommendations for teachers

    Keep the response simple, professional, and useful for teachers.
    """

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )

        return jsonify({
            "success": True,
            "insights": response.output_text
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

if __name__ == "__main__":

    init_db()
    print("Flask server starting...")
    app.run(debug=True,port=5002)