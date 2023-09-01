import { useState } from "react";

function AutoFillForm({ isSemOne, setter }) {
    const [formContent, setFormContent] = useState({
        courseList: ["COMP2119", "COMP2121", "COMP2396", "MATH2014", "CCST9013", "CCGL9011"],
        dayOffScore: 30,
        earlyTime: "8:30",
        earlyScore: -10,
        gapTime: 3,
        gapScore: -10
    })

    const [possibleList, setPossibleList] = useState([]);

    const addCourseList = () => {
        setFormContent({
            ...formContent,
            courseList: [...formContent.courseList, ""]
        })
    }

    const editCourseList = (event, index) => {
        setFormContent({
            ...formContent,
            courseList: [...formContent.courseList.slice(0, index), event.target.value.toUpperCase(), ...formContent.courseList.slice(index + 1)]
        })
    }

    const removeCourseList = (index) => {
        setFormContent({
            ...formContent,
            courseList: [...formContent.courseList.slice(0, index), ...formContent.courseList.slice(index + 1)]
        })
    }

    const handleFormChange = (event) => {
        setFormContent({
            ...formContent,
            [event.target.name]: event.target.value
        })
    }

    const courseListForm = formContent.courseList.map((item, index) => {
        return (
            <div key={index}>
                <input value={item} onChange={(event) => editCourseList(event, index)} />
                <button type="button" onClick={() => removeCourseList(index)}>X</button>
            </div>
        )
    })

    const handleSubmit = () => {
        const output = [];
        const data = JSON.parse(localStorage.getItem("timeTable"))[(isSemOne ? 0 : 1)]
        const possibleCourse = formContent.courseList.map(name => {
            return data.filter(course => course.courseName.includes(name))
        })
        const indexs = possibleCourse.map(() => {
            return 0
        })
        const endPoint = possibleCourse.map((item) => item.length - 1)
        const weekToIndex = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 }
        const timeTable = [];
        for (let i = 0; i < 7; i++) {
            const temp = [];
            for (let j = 0; j < 15; j++) {
                temp.push(false)
            }
            timeTable.push(temp)
        }
        const addToTable = (course, table) => {
            for (let i = 0; i < course.lectures.length; i++) {
                const [start, end] = course.lectures[i].time.split("-");
                for (let j = parseInt(start.split(":")[0]) - 8; j < parseInt(end.split(":")[0]) - 8; j++) {
                    if (table[weekToIndex[course.lectures[i].day]][j] && table[weekToIndex[course.lectures[i].day]][j] !== course.courseName) {
                        return true
                    } else {
                        table[weekToIndex[course.lectures[i].day]][j] = course.courseName
                    }
                }
            }
            return false
        }
        const getDayOff = (table) => {
            let dayOff = -2
            for (let i = 0; i < table.length; i++) {
                if (table[i].filter(item => item).length === 0) {
                    dayOff++
                }
            }
            console.log(dayOff)
            return dayOff
        }
        const getEarlyTime = (table, time) => {
            let earlyTime = 0;
            for (let i = 0; i < table.length; i++) {
                for (let j = 0; j < parseInt(time.split(":")[0]) - 7; j++) {
                    if (table[i][j]) {
                        earlyTime++
                        break
                    }
                }
            }
            console.log(earlyTime)
            return earlyTime
        }
        const getGap = (table, time) => {
            let gap = 0;
            for (let i = 0; i < table.length; i++) {
                let startCount = false;
                let dayCount = 0
                for (let j = 0; j < table[i].length; j++) {
                    if (table[i][j]) {
                        if (startCount && dayCount >= parseInt(time)) {
                            gap++
                        }
                        startCount = true;
                    } else {
                        if (startCount) {
                            dayCount++;
                        }
                    }
                } 
            }
            console.log(gap)
            return gap
        }
        while (JSON.stringify(endPoint) !== JSON.stringify(indexs)) {
            const courseList = indexs.map((item, index) => {
                return { ...possibleCourse[index][item], isChecked: true }
            })
            const copyTable = JSON.parse(JSON.stringify(timeTable))
            let toAdd = true
            for (let i = 0; i < indexs.length; i++) {
                if (addToTable(courseList[i], copyTable)) {
                    toAdd = false
                    break
                }
            } 
            let score = 0;
            if (toAdd) {
                score += getDayOff(copyTable)*parseInt(formContent.dayOffScore) 
                + getEarlyTime(copyTable, formContent.earlyTime)*parseInt(formContent.earlyScore) 
                + getGap(copyTable, formContent.gapTime)*parseInt(formContent.gapScore)
                output.push({score, courseList: JSON.parse(JSON.stringify(courseList))})
            }
            for (let i = indexs.length - 1; i >= 0; i--) {
                indexs[i]++;
                if (indexs[i] !== possibleCourse[i].length) {
                    break;
                } else {
                    indexs[i] = 0
                }
            }
        }
        setPossibleList(output.sort((a, b) => b.score - a.score))
        setter(output[0].courseList)
    }

    const renderPossibleList = possibleList.map((item, index) => {
        return (
            <div key={index} onClick={() => setter(item.courseList)}>
                List {index + 1}: {item.score}
            </div>
        )
    })

    return (
        <div>
            <form>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                Courses To Fill:
                            </td>
                            <td>
                                {courseListForm}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" onClick={addCourseList}>Add course</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Day Off score:
                                </label>
                            </td>
                            <td>
                                <input value={formContent.dayOffScore} name="dayOffScore" type="text" onChange={(event) => handleFormChange(event)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Early Time:
                                </label>
                            </td>
                            <td>
                                <input value={formContent.earlyTime} name="earlyTime" type="text" onChange={(event) => handleFormChange(event)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Early Score:
                                </label>
                            </td>
                            <td>
                                <input value={formContent.earlyScore} name="earlyScore" type="number" onChange={(event) => handleFormChange(event)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Gap Hours:
                                </label>
                            </td>
                            <td>
                                <input value={formContent.gapTime} name="gapTime" type="number" onChange={(event) => handleFormChange(event)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Gap Score:
                                </label>
                            </td>
                            <td>
                                <input value={formContent.gapScore} name="gapScore" type="number" onChange={(event) => handleFormChange(event)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button type="button" onClick={handleSubmit}>Fill</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
            <div>
                {renderPossibleList}
            </div>
        </div>
    )
}

export default AutoFillForm;