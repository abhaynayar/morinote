import "../Square/Square.css";

export default function Legend() {
  return (
    <>
      <div style={{ margin: 20 }}>
        <div>
        <p>Legend</p>
        <p>
          Note: In this app, we are making the assumption that number of weeks in a year is 52, when it is not exactly 52, due to which you might see a drift in the year and where your birthday collide. To tackle this, we have highlighted the week containing your birthday with a blue outline.
        </p>
        <div className="square filled"></div>
        <p>Weeks you have already lived.</p>
        <br />
        <div className="square"></div>
        <p>Weeks you have left in your life.</p>
        <br />
        <div className="square shade3"></div>
        <p>Weeks where you made a note.</p>
        <br />
        </div>
      </div>
    </>
  );
}
