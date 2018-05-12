import React, { Component } from 'react';
import PropTypes from 'prop-types';


const propTypes = {
  subject: PropTypes.string.isRequired,
};

const defaultProps = {
  subject: "COMPSCI%20-%20Computer%20Science",
};
const courseAPI = 'https://streamer.oit.duke.edu/curriculum/courses/subject/';
// const APIKey = restricted
const proxyURL = 'https://cors-anywhere.herokuapp.com/';

class subject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          courses: [],
        }
    }
    componentWillReceiveProps(nextProps) { //will be done as props change
      let initialCourses = [];
      var urlifiedSubject = encodeURIComponent(nextProps.subject);
      console.log(urlifiedSubject);
      fetch(proxyURL + courseAPI + urlifiedSubject + APIKey)
      .then(results => {
        return results.json();
      }).then(data => {
        initialCourses = data.ssr_get_courses_resp.course_search_result.subjects.subject.course_summaries.course_summary.map((course) => {
          return course
        });
        console.log(initialCourses);
        this.setState({
          courses: initialCourses,
        });
      });
    }

    render () {
        // let subject = this.props.state.subject;
        let optionItems = this.state.courses.map((course) =>
                <option key={course.catalog_nbr} value={course.subject+course.catalog_nbr + ' ' + course.course_title_long}>{course.subject+course.catalog_nbr + ' ' + course.course_title_long}</option>
            );
        return (
          <select>
            {optionItems} 
          </select>
             
        )
    }
}

export default subject;