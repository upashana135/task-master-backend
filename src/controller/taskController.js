const prisma = require("../lib/prisma")
const { errorResponse, successResponse } = require("../lib/responseWrapper")

const createTask = async(req, res) =>{
    try{
        const {title, description, due_date, projectId, teamId, assignedTo } = req.body
        const {userId, userEmail} = req.user
        const now = new Date();
        const start_date = now;
        const parsedDueDate = new Date(due_date);
        const created_by_user = userId
        const assigned_to_user = assignedTo !== "" ? assignedTo : userEmail

        if (!title || !due_date || !projectId || !teamId) {
            return errorResponse(res, "Fields marked with * are required.", 400);
        }

        if (parsedDueDate < now) {
            return errorResponse(res, "Due date cannot be in the past.", 400);
        }

        const task = {title, description, start_date : start_date, due_date : parsedDueDate, created_by_user, assigned_to_user, project_id: projectId, team_id:teamId }
        await prisma.Task.create({data: task})
        return successResponse(res, null, "Task created successfully", 201)
    }
    catch(error){
        console.log(error)
        return errorResponse(res, "Something went wrong!", 501)
    }
}

const getAllTask = async(req, res) =>{
    try{
        let {userId, userEmail} = req.user
        const projects = await prisma.Project.findMany({
            where: {
                OR: [
                { created_by: userId },
                {
                    project_teams: {
                    some: {
                        team: {
                        teamMembers: {
                            some: {
                                member_email: userEmail, 
                            },
                        },
                        },
                    },
                    },
                },
                ],
            },
            select: {
                id: true,
                name: true,
                project_teams: {
                    where: {
                        team: {
                        teamMembers: {
                            some: {
                                member_email: userEmail,
                            },
                        },
                        },
                    },
                    select: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        const tasks = await prisma.Task.findMany({
            where : {
                // assigned_to_user : userEmail,
                project_id : {
                    in: projects.map((project) => project.id)
                }
            },
            include: {
                project: {
                    select: {
                        name: true
                    }
                },
                team: {
                    select: {
                        name: true
                    }
                },
                taskComments : {
                    select:{
                        id: true,
                        commenter_email : true,
                        comment_text: true,
                        comment_date: true
                    }
                }
            }
        });
        const result = {
            projects,
            tasks
        }
        return successResponse(res, result, "Tasks returned successfully!", 201)
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something wnet wrong", 501)
    }
}

const deleteATask = async(req, res) => {
    try{
        const taskId = req.params.id;
        const {userId} = req.user
        const task = await prisma.Task.findUnique({id: taskId})
        if(task.created_by_user !== userId){
            return errorResponse(res, "Unauthorized user!", 401)
        }
        await prisma.Task.delete({where: { id: taskId }});
        return successResponse(res, "Tasks deleted successfully!", 201)
    }catch(error){
        return errorResponse(res, "Something wnet wrong", 501)
    }
}

const markTaskCompleted = async(req, res) => {
    try{
        const taskId = req.params.id;
        const {status, completed_date} = req.body;
        await prisma.Task.update({
            where: {id: taskId},
            data: {status: status, completed_date:completed_date},
        })
        return successResponse(res, "Tasks updated successfully!", 201)
    }catch(error){
        return errorResponse(res, "Something wnet wrong", 501)
    }
}

const addTaskComment = async(req, res) => {
    try{
        const {userEmail} = req.user
        const taskId = req.params.taskId
        const {commentText, commentDate} = req.body
        await prisma.TaskComment.create({
            data: {task_id: taskId, commenter_email: userEmail, comment_text : commentText, comment_date : commentDate}
        })
        return successResponse(res, null, "Commented successfully", 201)
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something wnet wrong", 501)
    }
}

module.exports = {createTask, getAllTask, deleteATask, markTaskCompleted, addTaskComment}