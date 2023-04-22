import { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import "./asteroid.css";

Chart.register(CategoryScale);

const Asteroid = () => {
  const [date, setDate] = useState({ startdate: "", enddate: "" });
  const [asteroidData, setAsteroidData] = useState({
    labels: [],
    datasets: [],
  });
  const [nearestAsteroidData, setNearestAsteroidData] = useState({
    labels: [],
    datasets: [],
  });
  const [fastestAsteroidData, setFastestAsteroidData] = useState({
    labels: [],
    datasets: [],
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apierror, setApierror] = useState(false);

  const handleSubmit = async () => {
    if (date.startdate == "" || date.enddate == "") {
      setError(true);
      return;
    }
    try {
      setApierror(false);
      setError(false);
      setLoading(true);
      let result = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date.startdate}&end_date=${date.enddate}&api_key=KHbNrktz2WOXP7ByuKjo6ipcrwXCSFiyopFTNjD6`
      );
      const data = Object.entries(result.data.near_earth_objects).map(
        ([key, value]) => ({ date: key, count: value.length })
      );
      setAsteroidData({
        labels: data.map((item) => item.date),
        datasets: [
          { label: "Asteroid Count", data: data.map((item) => item.count) },
        ],
      });

      // Extract data for nearest asteroid
      const nearestAsteroidList =
        result.data.near_earth_objects[
          Object.keys(result.data.near_earth_objects)[0]
        ];
      const nearestAsteroidData = {
        labels: nearestAsteroidList.map(
          (asteroid) => asteroid.close_approach_data[0].close_approach_date
        ),
        datasets: [
          {
            label: "Miss Distance (in Astronomical Units)",
            data: nearestAsteroidList.map(
              (asteroid) =>
                asteroid.close_approach_data[0].miss_distance.astronomical
            ),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      };
      setNearestAsteroidData(nearestAsteroidData);

      // Extract data for fastest asteroid
      const fastestAsteroidDayWise = [];
      Object.keys(result.data.near_earth_objects).forEach((date) => {
        const fastestAsteroid = result.data.near_earth_objects[date].reduce(
          (a, b) =>
            a.close_approach_data[0].relative_velocity.kilometers_per_hour >
            b.close_approach_data[0].relative_velocity.kilometers_per_hour
              ? a
              : b
        );
        fastestAsteroidDayWise.push({
          x: date,
          y: fastestAsteroid.close_approach_data[0].relative_velocity
            .kilometers_per_hour,
        });
      });
      setFastestAsteroidData({
        labels: Object.keys(result.data.near_earth_objects),
        datasets: [{ label: "Fastest Asteroid", data: fastestAsteroidDayWise }],
      });
      setLoading(false);
      setDate({ startdate: "", enddate: "" });
    } catch (err) {
      setLoading(false);
      setApierror(true);
    }
  };
  console.log(fastestAsteroidData, nearestAsteroidData);

  return (
    <>
      <section>
        {!loading ? (
          <div className="head">
            <input
              value={date.startdate}
              className="inp-1"
              onChange={(e) => setDate({ ...date, startdate: e.target.value })}
              type="date"
            />
            <input
              value={date.enddate}
              className="inp-2"
              onChange={(e) => setDate({ ...date, enddate: e.target.value })}
              type="date"
            />
            <button className="btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        ) : (
          <div className="loading">
            <h1>Please wait for a while Data is Loading......</h1>
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          {error && !date.startdate && <h1>Start date is missing</h1>}
          {error && !date.enddate && <h1>End date is missing</h1>}
          {apierror && <h1>The Feed date limit is only 7 Days</h1>}
        </div>

        {asteroidData.labels.length ? (
          <div className="chart-container">
            <h2 style={{ textAlign: "center" }}>Asteroid Chart</h2>
            <div className="graph-1">
              <Line
                data={asteroidData}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: "Asteroids by Date",
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
            <div className="graph-2">
              <Line
                data={nearestAsteroidData}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: "Nearest Asteroid",
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
            <div className="graph-3">
              <Line
                data={fastestAsteroidData}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: "Fastest Asteroid",
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        ) : null}
        <div className="details">
          {fastestAsteroidData.datasets.length ? (
            <h1>
              Fastest Asteroid : {fastestAsteroidData.datasets[0].data[0].y}{" "}
              km/h
            </h1>
          ) : (
            ""
          )}
        </div>
      </section>
    </>
  );
};

export default Asteroid;
