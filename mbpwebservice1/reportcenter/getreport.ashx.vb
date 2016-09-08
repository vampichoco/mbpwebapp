Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json
Imports DynamicLinq

Public Class getreport
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim reportName As String = context.Request.QueryString("r")

        Dim paramsString = HttpUtility.UrlDecode(context.Request.QueryString("param"))

        Dim params As String() =
            paramsString.Split(",")

        Dim reportFile As XDocument = XDocument.Load(context.Request.MapPath("reports.xml"))

        Dim report = (From rep In reportFile.<reportList>...<report> Where rep.@name = reportName
                      Select New With {
                             .descrip = rep.<info>.<descrip>.Value,
                             .where = rep.<filter>.<where>.Value,
                             .select = rep.<filter>.<select>.Value,
                             .scope = rep.<filter>.<scope>.Value
                             }).Single

        Dim scopeStr As String = report.scope
        Dim db As New mbpDataContext

        Dim asdsa = db.prods.AsQueryable

        Dim scope = GetPropertyValue(db, scopeStr)



        Dim q = scope.AsQueryable.Where(report.where, params).Select(report.select)

        Dim op As String = JsonConvert.SerializeObject(q)

        context.Response.Write(op)

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

    Public Function GetPropertyValue(ByVal obj As Object, ByVal PropName As String) As Object
        Dim objType As Type = obj.GetType()
        Dim pInfo As System.Reflection.PropertyInfo = objType.GetProperty(PropName)
        Dim PropValue As Object = pInfo.GetValue(obj, Reflection.BindingFlags.GetProperty, Nothing, Nothing, Nothing)
        Return PropValue
    End Function

End Class